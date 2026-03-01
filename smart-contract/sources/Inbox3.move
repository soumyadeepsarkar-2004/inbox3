module inbox3::Inbox3 {
    use std::vector;
    use aptos_std::table;
    use aptos_std::timestamp;
    use aptos_std::signer;
    use std::string::String;
    use aptos_framework::account;
    use aptos_framework::bcs;

    // ===== Named Error Codes =====
    /// Message does not exist in inbox
    const E_MESSAGE_NOT_FOUND: u64 = 1;
    /// Inbox resource already exists or does not exist when required
    const E_INBOX_NOT_FOUND: u64 = 2;
    /// Recipient does not have an inbox; they must call create_inbox first
    const E_RECIPIENT_NO_INBOX: u64 = 3;
    /// Group resource not found at the given address
    const E_GROUP_NOT_FOUND: u64 = 4;
    /// Sender is not a member of the group
    const E_NOT_A_MEMBER: u64 = 5;

    /// A single message
    struct Message has copy, drop, store {
        id: u64,
        sender: address,
        cid: vector<u8>,   // IPFS CID
        timestamp: u64,
        read: bool,
    }

    /// One per user, stored under their own account
    struct Inbox has key {
        messages: table::Table<u64, Message>,
        sent: table::Table<u64, Message>,
        next_id: u64,
        next_sent_id: u64,
    }

    /// A group message
    struct GroupMessage has copy, drop, store {
        sender: address,
        cid: vector<u8>,
        timestamp: u64,
        parent_id: vector<u8>,
    }

    /// A group chat resource
    struct Group has key {
        name: String,
        members: vector<address>,
        messages: table::Table<u64, GroupMessage>,
        next_msg_id: u64,
    }

    /// Track which groups a user belongs to
    struct UserGroups has key {
        groups: vector<address>,
    }

    /// Call *once* per user to create an inbox
    public entry fun create_inbox(user: &signer) {
        let addr = signer::address_of(user);
        if (!exists<Inbox>(addr)) {
            move_to(user, Inbox { 
                messages: table::new(), 
                sent: table::new(),
                next_id: 0,
                next_sent_id: 0
            });
        };
        if (!exists<UserGroups>(addr)) {
            move_to(user, UserGroups { groups: vector::empty() });
        };
    }

    /// Anyone can send a message to an address that already has an Inbox
    public entry fun send_message(
        sender: &signer,
        recipient: address,
        cid: vector<u8>
    ) acquires Inbox {
        assert!(exists<Inbox>(recipient), E_RECIPIENT_NO_INBOX);
        let sender_addr = signer::address_of(sender);
        let now = timestamp::now_seconds();

        // 1. Add to recipient's inbox
        let inbox = borrow_global_mut<Inbox>(recipient);
        let id = inbox.next_id;
        inbox.next_id = id + 1;
        let msg = Message {
            id,
            sender: sender_addr,
            cid,
            timestamp: now,
            read: false,
        };
        table::add(&mut inbox.messages, id, msg);

        // 2. Add to sender's outbox if they have an Inbox resource
        if (exists<Inbox>(sender_addr)) {
            let sender_ib = borrow_global_mut<Inbox>(sender_addr);
            let s_id = sender_ib.next_sent_id;
            sender_ib.next_sent_id = s_id + 1;
            let sent_msg = Message {
                id: s_id,
                sender: recipient, // In the sent table, 'sender' field stores the recipient's address for convenience
                cid,
                timestamp: now,
                read: true, // Sent messages are 'read' by default for the sender
            };
            table::add(&mut sender_ib.sent, s_id, sent_msg);
        };
    }

    /// Recipient marks one message as read
    public entry fun mark_read(recipient: &signer, id: u64) acquires Inbox {
        let inbox = borrow_global_mut<Inbox>(signer::address_of(recipient));
        assert!(table::contains(&inbox.messages, id), E_MESSAGE_NOT_FOUND);
        let m = table::borrow_mut(&mut inbox.messages, id);
        m.read = true;
    }

    /// Create a new group
    public entry fun create_group(creator: &signer, name: String) acquires UserGroups {
        let creator_addr = signer::address_of(creator);
        
        // Create a resource account for the group to ensure unique address
        let seed = *std::string::bytes(&name);
        vector::append(&mut seed, bcs::to_bytes(&creator_addr));
        vector::append(&mut seed, bcs::to_bytes(&timestamp::now_microseconds()));

        let (group_signer, _signer_cap) = account::create_resource_account(creator, seed);
        let group_addr = signer::address_of(&group_signer);
        
        let members = vector::empty();
        vector::push_back(&mut members, creator_addr);

        move_to(&group_signer, Group {
            name,
            members,
            messages: table::new(),
            next_msg_id: 0,
        });

        // Add to creator's group list
        if (!exists<UserGroups>(creator_addr)) {
            move_to(creator, UserGroups { groups: vector::empty() });
        };
        let user_groups = borrow_global_mut<UserGroups>(creator_addr);
        vector::push_back(&mut user_groups.groups, group_addr);
    }

    /// Join a group (open membership — any address can join)
    public entry fun join_group(user: &signer, group_addr: address) acquires Group, UserGroups {
        assert!(exists<Group>(group_addr), E_GROUP_NOT_FOUND);
        let user_addr = signer::address_of(user);
        let group = borrow_global_mut<Group>(group_addr);
        
        if (!vector::contains(&group.members, &user_addr)) {
            vector::push_back(&mut group.members, user_addr);
            
            // Add to user's group list
            if (!exists<UserGroups>(user_addr)) {
                move_to(user, UserGroups { groups: vector::empty() });
            };
            let user_groups = borrow_global_mut<UserGroups>(user_addr);
            if (!vector::contains(&user_groups.groups, &group_addr)) {
                vector::push_back(&mut user_groups.groups, group_addr);
            };
        }
    }

    /// Send a message to a group (sender must be a member)
    public entry fun send_group_message(sender: &signer, group_addr: address, cid: vector<u8>, parent_id: vector<u8>) acquires Group {
        assert!(exists<Group>(group_addr), E_GROUP_NOT_FOUND);
        let sender_addr = signer::address_of(sender);
        let group = borrow_global_mut<Group>(group_addr);
        
        // Check membership
        assert!(vector::contains(&group.members, &sender_addr), E_NOT_A_MEMBER);

        let id = group.next_msg_id;
        group.next_msg_id = id + 1;
        
        let msg = GroupMessage {
            sender: sender_addr,
            cid,
            timestamp: timestamp::now_seconds(),
            parent_id,
        };
        table::add(&mut group.messages, id, msg);
    }

    #[view]
    /// Return the inbox (received messages) with pagination.
    public fun inbox_of(addr: address, limit: u64, offset: u64): vector<Message> acquires Inbox {
        if (!exists<Inbox>(addr)) {
            vector::empty<Message>()
        } else {
            let ib = borrow_global<Inbox>(addr);
            let messages = vector::empty<Message>();
            let i = offset;
            let count = 0;
            while (i < ib.next_id && count < limit) {
                if (table::contains(&ib.messages, i)) {
                    let msg = *table::borrow(&ib.messages, i);
                    vector::push_back(&mut messages, msg);
                    count = count + 1;
                };
                i = i + 1;
            };
            messages
        }
    }

    #[view]
    /// Return the sent messages with pagination.
    public fun outbox_of(addr: address, limit: u64, offset: u64): vector<Message> acquires Inbox {
        if (!exists<Inbox>(addr)) {
            vector::empty<Message>()
        } else {
            let ib = borrow_global<Inbox>(addr);
            let messages = vector::empty<Message>();
            let i = offset;
            let count = 0;
            while (i < ib.next_sent_id && count < limit) {
                if (table::contains(&ib.sent, i)) {
                    let msg = *table::borrow(&ib.sent, i);
                    vector::push_back(&mut messages, msg);
                    count = count + 1;
                };
                i = i + 1;
            };
            messages
        }
    }

    #[view]
    /// Check if a specific message (by CID) was read in the recipient's inbox
    public fun is_cid_read(recipient: address, cid: vector<u8>): bool acquires Inbox {
        if (!exists<Inbox>(recipient)) return false;
        let ib = borrow_global<Inbox>(recipient);
        let i = 0;
        while (i < ib.next_id) {
            if (table::contains(&ib.messages, (i as u64))) {
                let msg = table::borrow(&ib.messages, (i as u64));
                if (msg.cid == cid) {
                    return msg.read
                };
            };
            i = i + 1;
        };
        false
    }

    #[view]
    /// Get total number of messages (sent + received) for an address
    public fun get_message_count(addr: address): u64 acquires Inbox {
        if (!exists<Inbox>(addr)) {
            0
        } else {
            let ib = borrow_global<Inbox>(addr);
            ib.next_id + ib.next_sent_id
        }
    }

    #[view]
    /// Check if an inbox exists for an address
    public fun inbox_exists(addr: address): bool {
        exists<Inbox>(addr)
    }

    #[view]
    /// Get groups a user is in
    public fun get_user_groups(addr: address): vector<address> acquires UserGroups {
        if (!exists<UserGroups>(addr)) {
            vector::empty()
        } else {
            borrow_global<UserGroups>(addr).groups
        }
    }

    #[view]
    /// Get group details (name and member list)
    public fun get_group_info(group_addr: address): (String, vector<address>) acquires Group {
        assert!(exists<Group>(group_addr), E_GROUP_NOT_FOUND);
        let group = borrow_global<Group>(group_addr);
        (group.name, group.members)
    }

    #[view]
    /// Get group messages
    public fun get_group_messages(group_addr: address): vector<GroupMessage> acquires Group {
        if (!exists<Group>(group_addr)) {
            vector::empty()
        } else {
            let group = borrow_global<Group>(group_addr);
            let messages = vector::empty<GroupMessage>();
            let i = 0;
            while (i < group.next_msg_id) {
                if (table::contains(&group.messages, (i as u64))) {
                    let msg = *table::borrow(&group.messages, (i as u64));
                    vector::push_back(&mut messages, msg);
                };
                i = i + 1;
            };
            messages
        }
    }
}
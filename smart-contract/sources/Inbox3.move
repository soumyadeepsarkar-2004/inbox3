module inbox3::Inbox3 {
    use std::vector;
    use aptos_std::table;
    use aptos_std::timestamp;
    use aptos_std::signer;

    /// A single message
    struct Message has copy, drop, store {
        sender: address,
        cid: vector<u8>,   // IPFS CID
        timestamp: u64,
        read: bool,
    }

    /// One per user, stored under their own account
    struct Inbox has key {
        messages: table::Table<u64, Message>,
        next_id: u64,
    }

    /// Call *once* per user to create an inbox
    public entry fun create_inbox(user: &signer) {
        let addr = signer::address_of(user);
        assert!(!exists<Inbox>(addr), 0);
        move_to(user, Inbox { messages: table::new(), next_id: 0 });
    }

    /// Anyone can send a message to an address that already has an Inbox
    public entry fun send_message(
        sender: &signer,
        recipient: address,
        cid: vector<u8>
    ) acquires Inbox {
        assert!(exists<Inbox>(recipient), 3); // Recipient must have an inbox
        let inbox = borrow_global_mut<Inbox>(recipient);
        let id = inbox.next_id;
        inbox.next_id = id + 1;
        let msg = Message {
            sender: signer::address_of(sender),
            cid,
            timestamp: timestamp::now_seconds(),
            read: false,
        };
        table::add(&mut inbox.messages, id, msg);
    }

    /// Recipient marks one message as read
    public entry fun mark_read(recipient: &signer, id: u64) acquires Inbox {
        let inbox = borrow_global_mut<Inbox>(signer::address_of(recipient));
        assert!(table::contains(&inbox.messages, id), 1); // Message must exist
        let m = table::borrow_mut(&mut inbox.messages, id);
        m.read = true;
    }

    #[view]
    /// Return the full inbox (view function)
    public fun inbox_of(addr: address): vector<Message> acquires Inbox {
        if (!exists<Inbox>(addr)) {
            vector::empty<Message>()
        } else {
            let ib = borrow_global<Inbox>(addr);
            let messages = vector::empty<Message>();
            let i = 0;
            while (i < ib.next_id) {
                if (table::contains(&ib.messages, i)) {
                    let msg = *table::borrow(&ib.messages, i);
                    vector::push_back(&mut messages, msg);
                };
                i = i + 1;
            };
            messages
        }
    }

    #[view]
    /// Get total number of messages for an address
    public fun get_message_count(addr: address): u64 acquires Inbox {
        if (!exists<Inbox>(addr)) {
            0
        } else {
            let ib = borrow_global<Inbox>(addr);
            ib.next_id
        }
    }

    #[view]
    /// Get a specific message by ID
    public fun get_message(addr: address, id: u64): Message acquires Inbox {
        let ib = borrow_global<Inbox>(addr);
        assert!(table::contains(&ib.messages, id), 2); // Message must exist
        *table::borrow(&ib.messages, id)
    }

    #[view]
    /// Check if an inbox exists for an address
    public fun inbox_exists(addr: address): bool {
        exists<Inbox>(addr)
    }
}
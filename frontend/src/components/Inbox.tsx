import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { download } from '../lib/ipfs';

const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);
const CONTRACT_ADDRESS = "0xf1768eb79d367572b8e436f8e3bcfecf938eeaf6656a65f73773c50c43b71d67";

interface Message {
  sender: string;
  cid: number[] | string;
  timestamp: number;
  read: boolean;
  plain?: string;
}

interface ProcessedMessage extends Message {
  plain: string;
  cidString?: string;
}

interface InboxProps {
  refreshKey?: number;
}

export default function Inbox({ refreshKey }: InboxProps) {
  const { account } = useWallet();
  const [msgs, setMsgs] = useState<ProcessedMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!account) return;
    console.log('Loading inbox - refreshKey:', refreshKey, 'account:', account.address);
    setLoading(true);
    try {
      console.log('Loading messages for account:', account.address);
      console.log('Using contract address:', CONTRACT_ADDRESS);

      const messages = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::Inbox3::inbox_of`,
          functionArguments: [account.address]
        }
      });

      console.log('Raw messages from contract:', messages);

      const messageList = messages[0] as Message[];
      console.log('Message list:', messageList);

      const processedMessages: ProcessedMessage[] = await Promise.all(messageList.map(async (m: Message, index: number) => {
        try {
          console.log(`Processing message ${index}:`, m);
          console.log('CID raw bytes:', m.cid);
          console.log('CID length:', m.cid.length);

          let messageContent = `Message #${index} from ${m.sender.slice(0, 6)}...${m.sender.slice(-4)}`;
          let cidString = '';

          try {
            if (typeof m.cid === 'string' && m.cid.startsWith('0x')) {
              const hexString = m.cid.slice(2);
              cidString = '';
              for (let i = 0; i < hexString.length; i += 2) {
                const hexByte = hexString.substr(i, 2);
                cidString += String.fromCharCode(parseInt(hexByte, 16));
              }
              console.log('CID decoded from hex successfully:', cidString);
            } else if (Array.isArray(m.cid)) {
              cidString = new TextDecoder().decode(new Uint8Array(m.cid));
              console.log('CID decoded successfully:', cidString);
            } else {
              console.log('Unknown CID format:', typeof m.cid);
              cidString = 'unknown-format';
            }
          } catch (decodeError) {
            console.log('CID decode failed, trying alternative method:', decodeError);
            try {
              if (Array.isArray(m.cid)) {
                cidString = String.fromCharCode(...m.cid);
                console.log('Alternative CID decode:', cidString);
              } else {
                cidString = 'decode-failed';
              }
            } catch (altError) {
              console.log('Alternative decode also failed:', altError);
              cidString = 'decode-failed';
            }
          }

          console.log('Processing message with CID:', cidString);

          try {
            if (cidString.startsWith('mock-cid-') || cidString.startsWith('fallback-cid-')) {
              console.log('Mock CID detected, retrieving stored message');
              try {
                const storedData = await download(cidString);
                const messageData = JSON.parse(storedData);
                messageContent = messageData.content || 'Test message';
                console.log('Retrieved mock message content:', messageContent);
              } catch (e) {
                console.log('Failed to retrieve mock data:', e);
                const timestamp = new Date(m.timestamp * 1000).toLocaleString();
                messageContent = `Message sent at ${timestamp}`;
              }
            } else if (cidString && cidString !== 'decode-failed') {
              const timestamp = new Date(m.timestamp * 1000).toLocaleString();

              try {
                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cidString}`);
                if (response.ok) {
                  const data = await response.json();
                  messageContent = data.content || data.message || `Message sent at ${timestamp}`;
                } else {
                  messageContent = `Message sent at ${timestamp} (CID: ${cidString.slice(0, 15)}...)`;
                }
              } catch (fetchError) {
                console.log('IPFS fetch failed:', fetchError);
                messageContent = `Message sent at ${timestamp} (CID: ${cidString.slice(0, 15)}...)`;
              }
            } else {
              const timestamp = new Date(m.timestamp * 1000).toLocaleString();
              messageContent = `Message sent at ${timestamp} (CID decode failed)`;
            }
          } catch (contentError) {
            console.log('Error getting message content:', contentError);
            const timestamp = new Date(m.timestamp * 1000).toLocaleString();
            messageContent = `Message sent at ${timestamp}`;
          }

          return {
            ...m,
            plain: messageContent,
            cidString
          };
        } catch (error) {
          console.error('Error processing message:', error, 'Message:', m);
          const timestamp = new Date((m.timestamp || Date.now() / 1000) * 1000).toLocaleString();
          return {
            ...m,
            plain: `Message from ${(m.sender || 'unknown').slice(0, 6)}...${(m.sender || 'unknown').slice(-4)} sent at ${timestamp}`,
            cidString: 'error'
          };
        }
      }));

      console.log('Processed messages:', processedMessages);
      setMsgs(processedMessages);
      console.log('Messages set in state, count:', processedMessages.length);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [account, refreshKey]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const markAsRead = async (messageId: number) => {
    if (!account) return;
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::Inbox3::mark_read`,
        type_arguments: [],
        arguments: [messageId]
      };

      const response = await window.aptos.signAndSubmitTransaction({ payload });
      await aptos.waitForTransaction({ transactionHash: response.hash });

      load();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-2 text-secondary">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {msgs.length === 0 ? (
        <div className="p-8 text-center">
          <div className="icon icon-gray w-12 h-12 mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12H16L14 15H10L8 12H2" />
              <path d="M5.45 5.11L2 12V18A2 2 0 0 0 4 20H20A2 2 0 0 0 22 18V12L18.55 5.11A2 2 0 0 0 16.84 4H7.16A2 2 0 0 0 5.45 5.11Z" />
            </svg>
          </div>
          <h3 className="font-medium text-primary mb-2">No messages yet</h3>
          <p className="text-secondary text-sm">
            Your inbox is empty. Messages will appear here once you receive them.
          </p>
        </div>
      ) : (
        <div className="inbox-container">
          <div className="space-y-0">
            {msgs.map((m, index) => (
              <div key={index} className={`message-item ${!m.read ? 'message-unread' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {m.sender.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary text-sm">
                        {m.sender.slice(0, 6)}...{m.sender.slice(-4)}
                      </span>
                      <div className="w-1 h-1 bg-muted rounded-full"></div>
                      <span className="text-xs text-muted">
                        {new Date(m.timestamp * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!m.read && (
                    <div className="w-2 h-2 bg-[#FF591B] rounded-full"></div>
                  )}
                </div>
                <div className="message-content">
                  <p className="text-sm text-primary">{m.plain}</p>
                </div>
                {!m.read && (
                  <div className="mt-3">
                    <button onClick={() => markAsRead(index)} className="btn btn-outline text-xs py-1 px-3">
                      Mark as Read
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

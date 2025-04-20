import React from 'react';
import { Box, Typography, Paper, Avatar, Button } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';

export default function ChatPage() {
  const { posterName } = useParams();
  const location = useLocation();
  const autoMessage = location.state?.autoMessage;
  const offerId = location.state?.offerId;

  // Dummy chat messages
  const [messages, setMessages] = React.useState([
    ...(autoMessage ? [{ from: 'me', text: autoMessage }] : [])
  ]);
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { from: 'me', text: input }]);
      setInput('');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', my: 4, p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: '#1976d2' }}>Chat with {posterName}</Typography>
      <Paper sx={{ minHeight: 240, mb: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 3 }}>
        {messages.length === 0 && <Typography color="text.secondary">No messages yet.</Typography>}
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', mb: 1 }}>
            <Box sx={{ bgcolor: msg.from === 'me' ? '#1976d2' : '#eceff1', color: msg.from === 'me' ? '#fff' : '#263238', px: 2, py: 1, borderRadius: 2, maxWidth: '75%' }}>
              {msg.text}
            </Box>
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, borderRadius: 8, border: '1px solid #b0bec5', padding: 10, fontSize: 16 }}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <Button variant="contained" color="primary" onClick={handleSend} sx={{ fontWeight: 700, borderRadius: 2 }}>
          Send
        </Button>
      </Box>
    </Box>
  );
}

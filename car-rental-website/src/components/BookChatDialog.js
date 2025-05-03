import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, TextField, IconButton } from '@mui/material';

export default function BookChatDialog({ open, onClose, offer, poster, isLoggedIn }) {
  const [message, setMessage] = useState('I want to book this car');
  const [sent, setSent] = useState(false);
  const [planeAnim, setPlaneAnim] = useState(false);

  const handleSend = () => {
    if (!isLoggedIn) {
      alert('You must be logged in to book a car. Please sign in or create an account.');
      return;
    }
    setPlaneAnim(true);
    setTimeout(() => {
      setSent(true);
      setPlaneAnim(false);
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1200);
    }, 800); // Animation duration
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{
  sx: {
    borderRadius: 3,
    boxShadow: '0 12px 48px #607d8b44',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.98)',
    p: 0,
  }
}}>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #f4f7fa 0%, #e3e8ee 100%)',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          px: 3,
          py: 2.2,
          mb: 0,
          minHeight: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: '#fff', boxShadow: '0 2px 8px #1976d233', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
            <img src={poster?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(poster?.name||'P')}&background=1976d2&color=fff`} alt={poster?.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
          </Box>
          <Box>
            <Box sx={{ fontWeight: 800, fontSize: 18, color: '#263238', mb: 0.2 }}>{poster?.name || 'Poster'}</Box>
            <Box sx={{ fontSize: 13, color: '#607d8b', fontWeight: 500 }}>Car Owner</Box>
          </Box>
        </Box>
        <IconButton aria-label="Close chat" onClick={onClose} sx={{ color: '#607d8b', ml: 1 }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 6.5L15.5 15.5M15.5 6.5L6.5 15.5" stroke="#607d8b" strokeWidth="2" strokeLinecap="round"/></svg>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2.5, pt: 2.5, px: 3.5, animation: 'fadeIn 0.5s', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'none' } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ px: 2.5, py: 0.7, borderRadius: 2, background: '#f4f7fa', color: '#1976d2', fontWeight: 800, fontSize: 16, boxShadow: '0 1px 4px #607d8b11', display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 0.2 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{marginRight: 6}} xmlns="http://www.w3.org/2000/svg"><path d="M7 17V19C7 20.1046 7.89543 21 9 21H15C16.1046 21 17 20.1046 17 19V17" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/><rect x="3" y="7" width="18" height="10" rx="3" stroke="#1976d2" strokeWidth="2"/></svg>
            {offer?.title}
          </Box>
        </Box>
        <Box sx={{ borderBottom: '1.5px solid #e3e8ee', mb: 2.5 }} />
        <TextField
          label="Message"
          multiline
          minRows={3}
          fullWidth
          value={message}
          onChange={e => setMessage(e.target.value)}
          sx={{
            mb: 2.5,
            background: '#f4f7fa',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: 16,
              color: '#263238',
              fontWeight: 500,
              background: '#f4f7fa',
            },
            '& .MuiInputLabel-root': {
              color: '#607d8b',
              fontWeight: 600,
            },
          }}
        />
        {sent && (
          <Box sx={{
            background: 'linear-gradient(90deg, #e3f2fd 0%, #f4f7fa 100%)',
            color: '#1976d2',
            fontWeight: 700,
            mb: 1,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            justifyContent: 'center',
            mt: 2,
            px: 2.5,
            py: 1.1,
            borderRadius: 2,
            boxShadow: '0 1px 8px #1976d211',
            letterSpacing: 0.1,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{marginRight: 4}} xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#bbdefb"/><path d="M7 13l3 3 7-7" stroke="#1976d2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{color:'#263238', fontWeight:600}}>Message sent successfully!</span>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#607d8b', fontWeight: 700, borderRadius: 99, px: 2.5, py: 1, textTransform: 'none', fontSize: 16 }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSend}
          sx={{
            bgcolor: '#1976d2',
            color: '#fff',
            borderRadius: 99,
            fontWeight: 700,
            px: 3.5,
            py: 1.2,
            fontSize: 16,
            boxShadow: '0 2px 16px #1976d222',
            textTransform: 'none',
            letterSpacing: 0.5,
            transition: 'all 0.18s',
            '&:hover': { bgcolor: '#1565c0', boxShadow: '0 4px 24px #1976d244' },
            display: 'flex', alignItems: 'center', gap: 1.1
          }}
          disabled={sent || !message.trim()}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginRight: 7,
            height: 22,
            transition: 'transform 0.8s cubic-bezier(.22,1,.36,1), opacity 0.8s cubic-bezier(.22,1,.36,1)',
            transform: planeAnim ? 'translateX(48px) rotate(-18deg) scale(1.18)' : 'none',
            opacity: planeAnim ? 0 : 1,
          }}>
            <svg width="24" height="22" viewBox="0 0 24 24" fill="none" style={{display:'block'}} xmlns="http://www.w3.org/2000/svg"><path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="#fff"/><path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="#1976d2" fillOpacity="0.18"/></svg>
          </span>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  Badge,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ConversationDialog from '../components/ConversationDialog';
import {
  Chat as ChatIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';

const StyledListItem = styled(ListItem)(({ theme, unread }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  backgroundColor: unread ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
  border: '1px solid',
  borderColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(4px)',
    borderColor: theme.palette.primary.main,
  },
  '& .MuiListItemSecondaryAction-root': {
    display: 'none',
  },
  '&:hover .MuiListItemSecondaryAction-root': {
    display: 'block',
  },
  padding: theme.spacing(1.5, 2),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 2,
}));

const MessagePreview = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 1,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
  color: 'inherit',
  opacity: 0.7,
  fontSize: '0.875rem',
});

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}));

const ConversationListPage = () => {
  const [conversations, setConversations] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5001/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Group messages by otherUser._id
        const groupedConversations = response.data.reduce((acc, conv) => {
          const userId = conv.otherUser._id;
          if (!acc[userId]) {
            acc[userId] = {
              otherUser: conv.otherUser,
              car: conv.car,
              messages: [],
            };
          }
          acc[userId].messages.push(conv.latestMessage);
          return acc;
        }, {});

        setConversations(groupedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleConversationClick = (userId) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedUserId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ flexGrow: 1, py: { xs: 2, md: 3 } }}>
        <Paper elevation={0} sx={{ 
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
            <Typography variant="h6" component="h1" fontWeight={600}>
              Messages
            </Typography>
          </Box>
          
          <SearchContainer>
            <TextField
              fullWidth
              size="small"
              placeholder="Search messages"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 10, bgcolor: 'background.paper' }
              }}
            />
          </SearchContainer>

          {loading ? (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading conversations...
              </Typography>
            </Box>
          ) : Object.keys(conversations).length === 0 ? (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" align="center">
                No conversations yet
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Start a new conversation to see it here
              </Typography>
            </Box>
          ) : (
            <List sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              p: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '3px',
              },
            }}>
              {Object.keys(conversations).map((userId, index) => {
                const conv = conversations[userId];
                return (
                  <React.Fragment key={userId}>
                    <StyledListItem 
                      button
                      unread={!conv.messages[conv.messages.length - 1]?.read}
                      onClick={() => handleConversationClick(conv.otherUser._id)}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          variant="dot"
                          color="primary"
                          invisible={!conv.otherUser.isOnline}
                        >
                          <Avatar 
                            src={conv.otherUser.avatar}
                            sx={{ 
                              width: 56, 
                              height: 56,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              fontSize: '1.25rem'
                            }}
                            alt={`${conv.otherUser.firstName} ${conv.otherUser.lastName}`}
                          >
                            {conv.otherUser.firstName[0]}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.5,
                            gap: 1
                          }}>
                            <Typography 
                              variant="subtitle1" 
                              fontWeight={!conv.messages[conv.messages.length - 1]?.read ? 600 : 'normal'}
                              noWrap
                              sx={{ 
                                flex: 1,
                                color: !conv.messages[conv.messages.length - 1]?.read ? 'text.primary' : 'inherit',
                                fontWeight: !conv.messages[conv.messages.length - 1]?.read ? 600 : 'normal'
                              }}
                            >
                              {conv.otherUser.firstName} {conv.otherUser.lastName}
                            </Typography>
                            <TimeStamp>
                              {conv.messages[conv.messages.length - 1]?.read ? (
                                <DoneAllIcon fontSize="inherit" color="primary" />
                              ) : (
                                <CheckIcon fontSize="inherit" color="disabled" />
                              )}
                              {formatDate(conv.messages[conv.messages.length - 1]?.createdAt || new Date())}
                            </TimeStamp>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {conv.car && conv.car.carName && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#3498db',
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}
                              >
                                <DirectionsCarIcon sx={{ fontSize: '0.9rem', opacity: 0.8 }} /> {conv.car.carName}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MessagePreview 
                                sx={{ 
                                  flex: 1,
                                  fontWeight: !conv.messages[conv.messages.length - 1]?.read ? 500 : 'normal',
                                  color: !conv.messages[conv.messages.length - 1]?.read ? 'text.primary' : 'text.secondary'
                                }}
                              >
                                {conv.messages[conv.messages.length - 1]?.text || 'No messages yet'}
                              </MessagePreview>
                              {!conv.messages[conv.messages.length - 1]?.read && (
                                <Box 
                                  sx={{
                                    bgcolor: 'primary.main',
                                    borderRadius: '50%',
                                    width: 8,
                                    height: 8,
                                    ml: 1,
                                    flexShrink: 0
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        primaryTypographyProps={{
                          noWrap: true,
                          component: 'div'
                        }}
                        secondaryTypographyProps={{
                          component: 'div',
                          sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            mt: 0.5
                          }
                        }}
                      />
                    </StyledListItem>
                    {index < Object.keys(conversations).length - 1 && (
                      <Divider variant="inset" component="li" sx={{ mx: 2 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          )}
          <ConversationDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            userId={selectedUserId}
            carId={conversations[selectedUserId]?.car?._id}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default ConversationListPage;

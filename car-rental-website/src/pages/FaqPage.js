import React from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  Grid,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaymentIcon from '@mui/icons-material/Payment';
import SecurityIcon from '@mui/icons-material/Security';

const faqs = [
  {
    question: 'What documents do I need to rent a car?',
    answer: 'You will typically need a valid driver\'s license (held for at least one year), a valid ID card or passport, and a credit card in the main driver\'s name for the security deposit. International driving permits may be required for licenses not in the Latin alphabet.',
  },
  {
    question: 'Is there a minimum age requirement for renting a car?',
    answer: 'Yes, the minimum age is usually 21 years old. However, drivers under 25 may incur a young driver surcharge and may be restricted from renting certain vehicle categories. Always check specific age requirements at the time of booking.',
  },
  {
    question: 'Can I add an additional driver?',
    answer: 'Currently, we do not offer the option to add additional drivers. Only the primary renter listed on the rental agreement is authorized to drive the vehicle.',
  },
  {
    question: 'What is your fuel policy?',
    answer: 'Our standard fuel policy is "full-to-full." This means you will receive the car with a full tank of fuel and are expected to return it full. Other options may be available, so please check your rental agreement.',
  },
  {
    question: 'What kind of insurance is included in the rental?',
    answer: 'Basic insurance, such as Collision Damage Waiver (CDW) and Theft Protection (TP), is often included, but with an excess. We offer additional insurance options to reduce or waive the excess. We highly recommend reviewing these options carefully.',
  },
  {
    question: 'What should I do in case of an accident or breakdown?',
    answer: 'In case of an accident, please follow these steps: 1) Ensure everyone is safe, 2) Take clear photos of the damage from multiple angles, 3) Exchange contact and insurance information with the other party, 4) Contact the police if necessary. For minor accidents without injuries, you may arrange directly with the other party for repairs. For breakdowns, please call our 24/7 roadside assistance number provided in your rental agreement.',
  },
  {
    question: 'Can I take the rental car to another country?',
    answer: 'Cross-border travel is generally restricted and depends on the country and vehicle type. Please inform us at the time of booking if you plan to travel abroad with the rental car, as specific permissions and fees may apply.',
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'Our cancellation policy varies depending on when you cancel. Free cancellations are typically available if made more than 48 hours before pick-up. Cancellations made closer to the pick-up time may incur a fee. Please refer to our terms and conditions.',
  },
];

const FaqPage = () => {
  const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Group FAQs by category for better organization
  const faqCategories = {
    'Rental Requirements': faqs.slice(0, 2),
    'Policies & Procedures': faqs.slice(2, 5),
    'Support & Assistance': faqs.slice(5, 8)
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  // Get icon based on category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Rental Requirements':
        return <DirectionsCarIcon sx={{ color: '#546e7a' }} />;
      case 'Policies & Procedures':
        return <PaymentIcon sx={{ color: '#455a64' }} />;
      case 'Support & Assistance':
        return <SecurityIcon sx={{ color: '#37474f' }} />;
      default:
        return <LiveHelpIcon sx={{ color: '#546e7a' }} />;
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ 
        backgroundColor: '#f1f5f9', 
        minHeight: 'calc(100vh - 64px)',
        backgroundImage: 'linear-gradient(to bottom, rgba(241, 245, 249, 0.9), rgba(241, 245, 249, 0.98)), url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <Container sx={{ py: { xs: 4, md: 6 } }}>
          <Paper 
            elevation={6} 
            sx={{
              p: { xs: 3, sm: 4, md: 5 }, 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '20px', 
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #546e7a 0%, #37474f 100%)',
                boxShadow: '0 8px 16px rgba(55, 71, 79, 0.2)',
                mb: 3
              }}>
                <HelpOutlineIcon sx={{ fontSize: {xs: 40, md: 56}, color: '#fff' }} />
              </Box>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: '#1e293b', 
                  fontWeight: '800', 
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
                  background: 'linear-gradient(90deg, #546e7a, #37474f)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#64748b', 
                maxWidth: '800px', 
                margin: '0 auto', 
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 500
              }}>
                Find quick answers to common questions about ConnectDZ's car sharing services, policies, and procedures.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mt: 3 }}>
                {Object.keys(faqCategories).map((category) => (
                  <Chip 
                    key={category}
                    icon={getCategoryIcon(category)}
                    label={category} 
                    sx={{ 
                      py: 2.5, 
                      px: 1, 
                      borderRadius: '50px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      '& .MuiChip-icon': { fontSize: '1.2rem' }
                    }} 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </Box>
            
            <Divider sx={{ 
              my: 5, 
              borderColor: 'rgba(203, 213, 225, 0.7)', 
              borderWidth: '1px',
              width: '70%',
              margin: '2rem auto 3rem'
            }} />

            <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
              {Object.entries(faqCategories).map(([category, categoryFaqs]) => (
                <Box key={category} sx={{ mb: 5 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pl: 2
                  }}>
                    {getCategoryIcon(category)}
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      sx={{ 
                        ml: 1.5, 
                        fontWeight: 600, 
                        color: '#1e293b',
                        fontSize: { xs: '1.3rem', md: '1.5rem' }
                      }}
                    >
                      {category}
                    </Typography>
                  </Box>
                  
                  {categoryFaqs.map((faq, index) => (
                <Accordion
                  key={`${category}-${index}`}
                  expanded={expanded === `${category}-panel${index}`}
                  onChange={handleChange(`${category}-panel${index}`)}
                  sx={{
                    backgroundColor: expanded === `${category}-panel${index}` ? 'rgba(241, 245, 249, 0.9)' : 'rgba(248, 250, 252, 0.8)',
                    boxShadow: expanded === `${category}-panel${index}` 
                               ? '0 8px 16px rgba(51, 65, 85, 0.08)' 
                               : '0 2px 4px rgba(51, 65, 85, 0.03)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px!important',
                    mb: 2.5,
                    overflow: 'hidden',
                    '&:before': {
                      display: 'none',
                    },
                    '&:hover': {
                      borderColor: expanded === `${category}-panel${index}` ? '#90a4ae' : '#546e7a',
                      transform: expanded === `${category}-panel${index}` ? 'none' : 'translateY(-2px)',
                      boxShadow: expanded === `${category}-panel${index}` 
                                ? '0 8px 16px rgba(55, 71, 79, 0.08)' 
                                : '0 6px 12px rgba(55, 71, 79, 0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <Box sx={{ 
                        backgroundColor: expanded === `${category}-panel${index}` ? '#546e7a' : 'rgba(84, 110, 122, 0.1)', 
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}>
                        <ExpandMoreIcon sx={{ 
                          color: expanded === `${category}-panel${index}` ? '#fff' : '#546e7a', 
                          fontSize: '1.2rem'
                        }} />
                      </Box>
                    }
                    aria-controls={`${category}-panel${index}bh-content`}
                    id={`${category}-panel${index}bh-header`}
                    sx={{ 
                      py: {xs: 1.5, md: 2},
                      px: {xs: 2, md: 3},
                      '.MuiAccordionSummary-content': {
                        alignItems: 'center',
                        m: 0
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      width: '100%',
                      gap: 2
                    }}>
                      <Box sx={{ 
                        backgroundColor: 'rgba(84, 110, 122, 0.1)', 
                        borderRadius: '50%',
                        width: {xs: 36, md: 42},
                        height: {xs: 36, md: 42},
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <QuestionAnswerIcon sx={{ color: '#546e7a', fontSize: {xs: '1.2rem', md: '1.4rem'} }} />
                      </Box>
                      <Typography sx={{ 
                        fontWeight: '600', 
                        color: '#1e293b', 
                        fontSize: {xs: '1rem', md: '1.15rem'},
                        lineHeight: 1.4,
                        letterSpacing: '0.01em'
                      }}>
                        {faq.question}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderTop: '1px solid rgba(203, 213, 225, 0.5)', 
                    borderBottomLeftRadius: '11px', 
                    borderBottomRightRadius: '11px',
                    px: {xs: 2, md: 3},
                    py: {xs: 2, md: 2.5}
                  }}>
                    <Typography sx={{ 
                      color: '#334155', 
                      lineHeight: 1.8, 
                      fontSize: {xs: '0.95rem', md: '1.05rem'}, 
                      pl: {xs: 0, md: 7},
                      pr: 1,
                      fontWeight: 400
                    }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
                </Box>
              ))}
              
              <Box sx={{ 
                mt: 6, 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'rgba(84, 110, 122, 0.05)',
                borderRadius: '16px',
                border: '1px dashed rgba(84, 110, 122, 0.3)'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: {xs: '1.1rem', md: '1.25rem'}
                }}>
                  Still have questions?
                </Typography>
                <Typography sx={{ 
                  color: '#475569', 
                  mb: 3,
                  fontSize: {xs: '0.95rem', md: '1.05rem'},
                  maxWidth: '600px',
                  mx: 'auto'
                }}>
                  If you couldn't find the answer to your question, our support team is here to help you.
                </Typography>
                <Chip 
                  icon={<LiveHelpIcon />}
                  label="Contact Support" 
                  sx={{ 
                    py: 3, 
                    px: 2, 
                    borderRadius: '50px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: '#546e7a',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#455a64'
                    },
                    '& .MuiChip-icon': { 
                      color: 'white',
                      fontSize: '1.2rem' 
                    },
                    cursor: 'pointer'
                  }}
                  onClick={() => window.location.href = '/contact'}
                />
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default FaqPage;

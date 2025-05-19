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
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Main page icon
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'; // Icon for individual FAQs

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
    answer: 'Yes, additional drivers can usually be added for an extra fee. They must also meet the age and license requirements and be present at the time of vehicle pick-up to sign the rental agreement.',
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
    answer: 'In case of an accident, ensure everyone is safe and contact the police if necessary. Then, call our 24/7 roadside assistance number provided in your rental agreement. For breakdowns, also use the provided assistance number.',
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

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ backgroundColor: '#f1f5f9', minHeight: 'calc(100vh - 64px)' }}>
        <Container sx={{ py: { xs: 3, md: 5 } }}>
          <Paper 
            elevation={4} 
            sx={{
              p: { xs: 2, sm: 3, md: 4 }, 
              backgroundColor: '#ffffff', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
              <HelpOutlineIcon sx={{ fontSize: {xs: 48, md: 64}, color: '#334155', mb: 1 }} />
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  color: '#334155', 
                  fontWeight: '700', 
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' }
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
                Find quick answers to common questions about our car rental services, policies, and procedures.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 4, borderColor: '#cbd5e1' }} />

            <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  expanded={expanded === `panel${index}`}
                  onChange={handleChange(`panel${index}`)}
                  sx={{
                    backgroundColor: expanded === `panel${index}` ? '#e2e8f0' : '#f8fafc',
                    boxShadow: expanded === `panel${index}` 
                               ? '0 4px 12px rgba(51, 65, 85, 0.1)' 
                               : '0 1px 3px rgba(51, 65, 85, 0.05)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px!important', // important to override default square corners
                    mb: 2,
                    '&:before': {
                      display: 'none', // Removes the default top border line of accordion
                    },
                    '&:hover': {
                      borderColor: '#94a3b8'
                    },
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#475569' }} />}
                    aria-controls={`panel${index}bh-content`}
                    id={`panel${index}bh-header`}
                    sx={{ 
                      py: {xs: 0.5, md:1 },
                      '.MuiAccordionSummary-content': {
                        alignItems: 'center'
                      }
                    }}
                  >
                    <QuestionAnswerIcon sx={{ color: '#475569', mr: 1.5, fontSize: '1.3rem' }} />
                    <Typography sx={{ fontWeight: '500', color: '#334155', fontSize: {xs: '1rem', md: '1.1rem'} }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#ffffff', borderTop: '1px solid #cbd5e1', borderBottomLeftRadius: '7px', borderBottomRightRadius: '7px' }}>
                    <Typography sx={{ color: '#475569', lineHeight: 1.7, fontSize: {xs: '0.9rem', md: '1rem'}, p: {xs: 1, md: 1.5} }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default FaqPage;

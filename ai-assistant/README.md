# AI Assistant for Car Rental Website

This folder contains the implementation of an AI assistant for the car rental website, built using ChatterBot and Flask as outlined in `tt.md`.

## Setup Instructions

1. **Install Required Libraries**:
   Open a terminal in this directory and run:
   ```bash
   pip install chatterbot==1.0.5 chatterbot-corpus flask
   ```

2. **Run the Chatbot**:
   Navigate to this folder and run:
   ```bash
   python app.py
   ```
   Then, open a browser and go to `http://127.0.0.1:5000` to interact with the chatbot.

## Integration with Website

To integrate the chatbot into the main website, copy the HTML/JavaScript from the `home()` function in `app.py` into your site's frontend, and update the API endpoint to your deployed app's URL if necessary.

## Customization

- **Training Data**: Add more question-answer pairs to the `custom_data` list in `app.py` to expand the chatbot's knowledge.
- **UI**: Modify the HTML in the `home()` function to match your website’s design.

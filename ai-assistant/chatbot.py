from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

# Create a new chatbot instance
chatbot = ChatBot('CarRentalBot')

# Create a trainer for the chatbot
trainer = ChatterBotCorpusTrainer(chatbot)

# Train the chatbot with English language data
trainer.train('chatterbot.corpus.english')

# Optional: Add custom car rental training data
custom_data = [
    ('What cars do you have?', 'We offer sedans, SUVs, and vans. What type are you looking for?'),
    ('How much is a rental?', 'Prices start at $30/day for sedans. Would you like a detailed quote?'),
    ('How do I book a car?', 'Visit our website, select your car, choose dates, and confirm your booking.'),
    ('Do you offer insurance?', 'Yes, we provide optional insurance starting at $10/day.')
]

# Train with custom data
for question, answer in custom_data:
    chatbot.storage.create(text=question, in_response_to=None, conversation='training')
    chatbot.storage.create(text=answer, in_response_to=question, conversation='training')

# Test the chatbot (optional, for debugging)
while True:
    try:
        user_input = input('You: ')
        if user_input.lower() == 'exit':
            break
        response = chatbot.get_response(user_input)
        print('Bot:', response)
    except (KeyboardInterrupt, EOFError):
        break

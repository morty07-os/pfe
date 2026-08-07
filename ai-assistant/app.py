from flask import Flask, request, jsonify
from difflib import get_close_matches
import requests
import os

app = Flask(__name__)

# Simplified concept mappings with more natural language
topic_groups = {
    'booking': ['book', 'reserve', 'rent', 'get a car', 'hire', 'reservation', 'how use'],
    'pricing': ['cost', 'price', 'how much', 'rate', 'fee', 'pay', 'payment', 'afford'],
    'insurance': ['insure', 'cover', 'protection', 'damage', 'accident', 'warranty', 'safe'],
    'documents': ['id', 'license', 'papers', 'require', 'need', 'proof', 'documentation'],
    'availability': ['when', 'date', 'time', 'available', 'schedule', 'calendar', 'soon'],
    'car_recommendation': ['recommend', 'suggest', 'looking for', 'need a car', 'want', 'prefer', 'which car', 'what vehicle']
}

# Simple chatbot responses dictionary
responses = {
    "what cars do you have": "We offer sedans, SUVs, vans, and luxury vehicles. What type are you looking for?",
    "how much is a rental": "Prices start at DZD2000/day for economy cars. SUVs start at $50/day and luxury cars at $100/day.",
    "how do i book a car": "To book a car:\n1. Log into your account (or register first)\n2. Browse our car listings and check availability\n3. Message the owner to confirm rental details\n4. After agreeing, make payment and send proof to owner\n5. Owner will forward to admin for final approval\n6. You'll get booking confirmation within 24 hours",
    "do you offer insurance": "Yes, we provide comprehensive insurance options starting at $10/day with various coverage levels.",
    "what documents do i need": "You'll need a valid driver's license, credit card, and proof of insurance if declining our coverage.",
    "is there a mileage limit": "Standard rentals include 100 free kilometers per day, with 1.5x after that.",
   
   
   
    
   
    "what's your fuel policy": "We operate on a full-to-full policy. Return the car with the same fuel level to avoid charges.",
    "how to book": "Here's our booking process:\n1. Create an account on our website\n2. Browse available cars and select your preferred vehicle\n3. Contact the car owner to discuss rental terms\n4. Once agreed, make the payment\n5. Send the payment proof to the owner\n6. The owner will submit your booking to admin for approval\n7. You'll receive a confirmation email with rental details",
    "hi": "Hello! Welcome to our car rental service. How can I assist you today?",
    "hello": "Hi there! Ready to find your perfect rental car? What do you need help with?",
    "bye": "Thank you for choosing us! Safe travels and we hope to serve you again soon.",
    "thank you": "You're very welcome! Let us know if you need anything else for your car rental.",
    "how to rent out my car": "To list your car for rent:\n1. Create a car owner account\n2. Submit your car details (photos, specs, price)\n3. Our team will validate the information within 24h\n4. Once approved, your car will appear in listings\n5. You'll receive booking requests from renters\n6. Communicate with renter to confirm details\n7. After payment confirmation, submit to admin\n8. You'll receive a finalized rental agreement",
    "rent my car": "Here's how to rent out your vehicle:\n1. Register as a car owner on our platform\n2. Complete the car listing form with all details\n3. Our admin will verify your documents and car info\n4. When approved, renters can book your car\n5. You'll negotiate rental terms directly\n6. After payment proof is received, submit to admin\n7. Admin will finalize the rental contract",
}

# Car database (mock - replace with actual API call later)
car_database = {
    "sedan": {
        "models": ["Toyota Camry", "Honda Accord", "Hyundai Elantra"],
        "features": ["4 seats", "good mileage", "automatic transmission", "trunk space"],
        "price_range": "DZD2000-3000/day"
    },
    "suv": {
        "models": ["Toyota RAV4", "Honda CR-V", "Ford Explorer"],
        "features": ["7 seats", "4WD", "spacious", "family-friendly"],
        "price_range": "DZD3500-5000/day"
    },
    "luxury": {
        "models": ["Mercedes E-Class", "BMW 5 Series", "Audi A6"],
        "features": ["premium", "leather seats", "advanced tech", "powerful engine"],
        "price_range": "DZD8000-12000/day"
    },
    "van": {
        "models": ["Toyota Hiace", "Mercedes Sprinter", "Ford Transit"],
        "features": ["8+ seats", "cargo space", "group travel", "comfortable"],
        "price_range": "DZD4000-6000/day"
    }
}

# Default response for unknown queries
default_response = "I'm sorry, I didn't understand that. Could you please rephrase or ask something else about car rentals?"

# Helper function for fuzzy matching
def get_best_match(query, questions):
    matches = get_close_matches(query, questions, n=1, cutoff=0.6)
    return matches[0] if matches else None

# Update car recommendation function to use real API
def get_car_recommendation(user_input):
    try:
        # 1. Verify API connection
        api_url = f"{os.getenv('REACT_APP_API_URL', 'http://localhost:5001')}/api/cars"
        response = requests.get(api_url, timeout=3)
        
        if response.status_code != 200:
            return f"Can't access car data (API status: {response.status_code}). Please try again later."
            
        cars = response.json().get('data', [])
        
        if not cars:
            return "No cars available currently. Please check back later."
            
        # 2. Process user input
        input_lower = user_input.lower()
        car_types = ['sedan', 'suv', 'luxury', 'van', 'truck']
        requested_types = [t for t in car_types if t in input_lower]
        
        # 3. Filter cars
        matches = []
        for car in cars:
            # Match type
            car_type = car.get('vehicleType', '').lower()
            if requested_types and car_type in requested_types:
                matches.append(car)
                continue
                
            # Match features
            features = [f.lower() for f in car.get('features', [])]
            if any(f in input_lower for f in features):
                matches.append(car)
        
        # 4. Format response
        if not matches:
            return "No matching cars found. Try simpler terms like 'SUV' or 'cheap'."
            
        response = "🔍 Matching cars:\n\n"
        for car in matches[:3]:  # Limit to 3 best matches
            response += f"🚗 {car.get('make', 'Car')} {car.get('model', '')} ({car.get('year', '')})\n"
            response += f"   • Type: {car.get('vehicleType', 'N/A')}\n"
            response += f"   • Price: {car.get('dailyRate', '?')} DZD/day\n"
            response += f"   • Features: {', '.join(car.get('features', []))}\n"
            response += f"   • View: {os.getenv('REACT_APP_FRONTEND_URL', 'http://localhost:3000')}/cars/{car.get('_id', '')}\n\n"
        
        return response
        
    except requests.exceptions.RequestException as e:
        print(f"API Error: {str(e)}")
        return "⚠️ Our car search is temporarily unavailable. Please visit our Offers page directly."
    except Exception as e:
        print(f"Recommendation Error: {str(e)}")
        return "Sorry, I couldn't process your request. Please try different wording."

# Route for the homepage
@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Car Rental Chatbot</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            #chatbox { border: 1px solid #ccc; padding: 10px; height: 300px; overflow-y: scroll; }
            #user_input { width: 80%; padding: 5px; }
            button { padding: 5px 10px; }
        </style>
    </head>
    <body>
        <h1>Car Rental Chatbot</h1>
        <div id="chatbox"></div>
        <input type="text" id="user_input" placeholder="Type your question here...">
        <button onclick="sendMessage()">Send</button>
        <script>
            function sendMessage() {
                let input = document.getElementById('user_input').value;
                if (input.trim() === '') return;
                let chatbox = document.getElementById('chatbox');
                chatbox.innerHTML += '<p><b>You:</b> ' + input + '</p>';
                fetch('/get_response', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: input })
                })
                .then(response => response.json())
                .then(data => {
                    chatbox.innerHTML += '<p><b>Bot:</b> ' + data.response + '</p>';
                    chatbox.scrollTop = chatbox.scrollHeight;
                });
                document.getElementById('user_input').value = '';
            }
            document.getElementById('user_input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
        </script>
    </body>
    </html>
    '''

# Route to handle chatbot responses
@app.route('/get_response', methods=['POST'])
def get_response():
    try:
        user_input = request.json['message'].lower().strip()
        
        # 1. Check for direct question matches first
        direct_questions = {
            'how': responses.get('how do i book a car'),
            'what': responses.get('what documents do i need'),
            'can i': responses.get('can i extend my rental'),
            'do you': responses.get('do you offer insurance')
        }
        
        for prefix, response in direct_questions.items():
            if user_input.startswith(prefix):
                return jsonify({'response': response or default_response})
        
        # 2. Check topic groups
        for topic, keywords in topic_groups.items():
            if any(f' {kw} ' in f' {user_input} ' for kw in keywords):
                if topic == 'car_recommendation':
                    return jsonify({'response': get_car_recommendation(user_input)})
                topic_responses = {
                    'booking': responses.get('how to book'),
                    'pricing': responses.get('how much is a rental'),
                    'insurance': responses.get('do you offer insurance'),
                    'documents': responses.get('what documents do i need'),
                    'availability': 'Please check our website calendar for specific date availability.'
                }
                return jsonify({'response': topic_responses.get(topic, default_response)})
        
        # 3. Final fallback to fuzzy matching
        best_match = get_best_match(user_input, responses.keys())
        return jsonify({'response': responses.get(best_match, default_response)})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'response': "Sorry, I'm having trouble understanding. Could you rephrase that?"})

if __name__ == '__main__':
    try:
        print("Starting Flask server on port 5001...")
        app.run(debug=True, port=5001)
        print("Server started successfully.")
    except Exception as e:
        print(f"Error starting server: {e}")

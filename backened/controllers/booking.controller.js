export const createBooking = (req, res) => {
    // Logic to create a new booking
    res.status(201).send("Booking created successfully");
};

export const getBookings = (req, res) => {
    // Logic to fetch all bookings
    res.status(200).send("List of bookings");
};

export const updateBooking = (req, res) => {
    // Logic to update a booking by ID
    res.status(200).send("Booking updated successfully");
};

export const deleteBooking = (req, res) => {
    // Logic to delete a booking by ID
    res.status(200).send("Booking deleted successfully");
};

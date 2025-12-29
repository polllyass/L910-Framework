function generateRandomTicket(playId) {
  const seatLetters = ['A', 'B', 'C', 'D', 'E'];
  const seatNumbers = Array.from({length: 20}, (_, i) => i + 1);
  return {
    playId: playId || Math.floor(Math.random() * 5) + 1,
    seat: `${seatLetters[Math.floor(Math.random() * seatLetters.length)]}${seatNumbers[Math.floor(Math.random() * seatNumbers.length)]}`,
    price: Math.floor(Math.random() * 2000) + 500,
    isSold: Math.random() > 0.7,
    buyerName: Math.random() > 0.5 ? "Случайный Покупатель" : "",
    purchaseDate: new Date().toISOString(),
    paymentMethod: ["card", "cash", "online"][Math.floor(Math.random() * 3)],
    seatType: ["parterre", "balcony", "vip"][Math.floor(Math.random() * 3)],
    discount: Math.floor(Math.random() * 30)
  };
}
module.exports = { generateRandomTicket };
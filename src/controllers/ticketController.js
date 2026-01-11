const fs = require('fs');
const path = require('path');
const TICKETS_FILE = path.join(__dirname, '../../data/tickets.json');
function readTickets() {
  try {
    const data = fs.readFileSync(TICKETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
function writeTickets(tickets) {
  fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), 'utf8');
}
class TicketController {
  static getAllTickets(req, res) {
    const tickets = readTickets();
    res.json(tickets);
  }
  static getTicketById(req, res) {
    const tickets = readTickets();
    const id = parseInt(req.params.id);
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: 'Билет не найден' });
    }
    res.json(ticket);
  }
  static createTicket(req, res) {
    const tickets = readTickets();
    const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
    const newTicket = {
      id: newId,
      playId: 1,
      seat: 'A' + (tickets.length + 1),
      price: 1000,
      isSold: false,
      buyerName: '',
      purchaseDate: null,
      paymentMethod: '',
      seatType: 'standard',
      discount: 0,
      reservedUntil: null
    };
    
    tickets.push(newTicket);
    writeTickets(tickets);
    res.status(201).json(newTicket);
  }

  static updateTicket(req, res) {
    const tickets = readTickets();
    const id = parseInt(req.params.id);
    const index = tickets.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Билет не найден' });
    }
    
    tickets[index] = {
      ...tickets[index],
      ...req.body,
      id: id
    };   
    writeTickets(tickets);
    res.json(tickets[index]);
  }
  static partialUpdateTicket(req, res) { //неидемпотентный
    const tickets = readTickets();
    const id = parseInt(req.params.id);
    const index = tickets.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Билет не найден' });
    }
    const modifiedCount = tickets[index].modifiedCount || 0;
    
    tickets[index] = {
      ...tickets[index],
      ...req.body,
      id: id,
      modifiedCount: modifiedCount + 1,
      lastModified: new Date().toISOString()
    };
    
    writeTickets(tickets);
    res.json(tickets[index]);
  }

  static deleteTicket(req, res) {
    const tickets = readTickets();
    const id = parseInt(req.params.id);
    const index = tickets.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Билет не найден' });
    }
    
    const deletedTicket = tickets.splice(index, 1)[0];
    writeTickets(tickets);
    res.json({ message: 'Билет удален', ticket: deletedTicket });
  }
}

module.exports = TicketController;
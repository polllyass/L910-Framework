const fs = require('fs');
const path = require('path');

const PLAYS_FILE = path.join(__dirname, '../../data/plays.json');

function readPlays() {
  try {
    const data = fs.readFileSync(PLAYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения plays.json:', error);
    return [];
  }
}

function writePlays(plays) {
  try {
    fs.writeFileSync(PLAYS_FILE, JSON.stringify(plays, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка записи plays.json:', error);
  }
}

class PlayController {
  static getAllPlays(req, res) {
    const plays = readPlays();
    res.json(plays);
  }

  static getPlayById(req, res) {
    const plays = readPlays();
    const id = parseInt(req.params.id);
    const play = plays.find(p => p.id === id);
    
    if (!play) {
      return res.status(404).json({ error: 'Спектакль не найден' });
    }
    
    res.json(play);
  }

  static createPlay(req, res) {
    const plays = readPlays();
    const newId = plays.length > 0 ? Math.max(...plays.map(p => p.id)) + 1 : 1;
    
    const newPlay = {
      id: newId,
      title: req.body.title || 'Новый спектакль',
      author: req.body.author || 'Неизвестный автор',
      genre: req.body.genre || 'Драма',
      duration: req.body.duration || 120,
      premiereDate: req.body.premiereDate || new Date().toISOString().split('T')[0],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      actors: req.body.actors || [],
      price: req.body.price || 1000
    };
    
    plays.push(newPlay);
    writePlays(plays);
    res.status(201).json(newPlay);
  }

  static updatePlay(req, res) {
    const plays = readPlays();
    const id = parseInt(req.params.id);
    const index = plays.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Спектакль не найден' });
    }
    
    plays[index] = {
      ...plays[index],
      ...req.body,
      id: id
    };
    
    writePlays(plays);
    res.json(plays[index]);
  }

  static partialUpdatePlay(req, res) {
    const plays = readPlays();
    const id = parseInt(req.params.id);
    const index = plays.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Спектакль не найден' });
    }
    
    const modifiedCount = plays[index].modifiedCount || 0;
    
    plays[index] = {
      ...plays[index],
      ...req.body,
      id: id,
      modifiedCount: modifiedCount + 1,
      lastModified: new Date().toISOString()
    };
    
    writePlays(plays);
    res.json(plays[index]);
  }

  static deletePlay(req, res) {
    const plays = readPlays();
    const id = parseInt(req.params.id);
    const index = plays.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Спектакль не найден' });
    }
    
    const deletedPlay = plays.splice(index, 1)[0];
    writePlays(plays);
    res.json({ message: 'Спектакль удален', play: deletedPlay });
  }
}

module.exports = PlayController;
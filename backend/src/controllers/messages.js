import Message from '../models/Message.js';
import User from '../models/User.js';

export async function getMessages(req, res) {
  try {
    const sender = req.user._id;
    const { receiver } = req.query;

    if (!sender || !receiver) {
      return res.status(400).json({ message: 'sender and receiver are required' });
    }

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    })
      .sort('time')
      .populate('sender', 'username avatar')   // populate sender fields
      .populate('receiver', 'username avatar'); // populate receiver fields

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
}
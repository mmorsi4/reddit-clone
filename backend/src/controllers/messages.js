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
<<<<<<< HEAD
}
=======
}

export async function sendFeedMessage(req, res) {
  try {
    const sender = req.user._id;
    const { receiverId, text } = req.body;

    const message = await Message.create({
      sender,
      receiver: receiverId,
      text,
      time: new Date()
    });

    const populated = await message.populate("sender", "username avatar");

    req.io.to(receiverId.toString()).emit("receive_message", populated);

    res.status(201).json(message);
  } catch (err) {
    console.error("Share feed message error:", err);
    res.status(500).json({ message: "Failed to send feed link" });
  }
}
>>>>>>> aca04ce2fe68b221fef66e8c0d214b526abb00d5

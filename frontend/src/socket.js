import { io } from "socket.io-client";

// create the socket but connect only in frontend
const socket = io("http://localhost:5001", { autoConnect: false });

export default socket;

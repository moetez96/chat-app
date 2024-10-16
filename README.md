# Chat App

This is the frontend of SocialApp, a responsive messeging application built with Angular.

The app allows users to register, log in, search for new friends, send and manage friendship requests, and chat in real-time with other users. 

WebSocket communication, powered by STOMP, enables real-time notifications and live chat.

## Live Demo
Check out the live demo of the app here: 
[Chat App Live Demo](https://chat-app-rust-phi.vercel.app/)

## Features
- **User Registration and Login:** Secure registration and login using JWT-based authentication.
- **Search Friends:** Users can search for other users by username.
- **Friendship Requests:** Send, accept, and manage friendship requests.
- **Chat:** Engage in real-time one-on-one messaging with friends.
- **Real-time Notifications:** Receive real-time notifications for new messages, friend requests, and online/offline.
- **Responsive Design:** Fully responsive design, ensuring smooth functionality across desktops, tablets, and mobile devices.

## Usage
- **Register:** Sign up using the registration form.
- **Login:** Log in using your credentials.
- **Search Friends:** Use the search bar to find new friends by name or username.
- **Friendship Requests:** Send or manage friendship requests through the dedicated section.
- **Chat:** Start a conversation with any of your friends in real-time.
- **Notifications:** Receive real-time updates for new messages, requests, and friend activity via WebSockets and STOMP.

## Technologies Used
- **Angular:** Frontend framework for building dynamic, responsive user interfaces.
- **STOMP (Simple Text Oriented Messaging Protocol):** Protocol used for WebSocket communication.
- **JWT:** Secure user authentication.   
- **CSS:** Styling for responsive layout and design. 

## Getting Started

Follow these instructions to set up and run the project locally for development and testing purposes.

```
-> git clone https://github.com/moetez96/chat-app.git
-> cd chat-app
-> npm install
-> npm serve
```

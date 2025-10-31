# Reddit-clone Backend (Merged)

This backend merges strengths from two uploaded projects into a modular, production-ready Express + Mongoose backend.

Features
- Modular folder structure: controllers, models, routes, middleware
- JWT authentication, bcrypt password hashing
- Post, Comment, Community, User models with basic relations
- Validation with Joi, rate limiting, helmet, CORS
- .env.example included

How to run
1. Copy `.env.example` to `.env` and update values.
2. `npm install`
3. `npm run dev` (nodemon) or `npm start`

Notes
- This is a starting point. Add tests, CI, and more robust production configuration for deployment.

import express from 'express';
import { signup, login , checkAuth , logout , resetPassword} from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  password: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  usernameOrEmail: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/check', authMiddleware, checkAuth);
router.post('/logout', logout);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);



export default router;

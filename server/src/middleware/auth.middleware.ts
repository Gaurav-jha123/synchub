import {Request,Response , NextFunction} from 'express';

import AuthService from '../services/auth.service';
import User from '../models/User';


declare global {
    namespace Express {
        interface Request{
            user ? : any;
        }
    }
}

export const authenticate = async(req : Request , res : Response , next : NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({message : 'Authentication required please provide the token in auth header'});
        }  
        const token =  authHeader.split(' ')[1];
        const paylaod = AuthService.verifyAccessToken(token);
        if(!paylaod){
            return res.status(401).json({message : 'Invalid or expired token please regenrate'});
        }

        const user = await User.findById(paylaod.userId).select('-password');
        if(!user){
            return res.status(401).json({message : 'User not found'});
        }

        req.user = user;
        next();
    } catch (error : any)  {
            console.error(`Auth middleware error:` , error);
            return res.status(500).json({ message : `Server error`});
    }
};


// role based authorization
export const authorize = (...roles : string[]) => {
    return (req : Request, res : Response , next : NextFunction) => {
        if(!req.user){
            return res.status(401).json({message : `Authentication required`});

        }

        if(!roles.includes(req.user.roles)){
            return res.status(403).json({message : `Access forbidden`});
        }
        next();
    };
};
import jwt from 'jsonwebtoken';
import { env } from '../config/env';


export function signToken(payload: {sub:string,username:string}): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): {sub:string,username:string} {
  const data :any = jwt.verify(token, env.jwtSecret);
   
  const payload ={
    sub : data.sub,
    username : data.username,
  }
 
return payload;
}



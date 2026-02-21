/**
 * @fileoverview Firebase Authentication Client Initializer.
 * This file is responsible for exporting the initialized Auth instance.
 */
import { getAuth, type Auth } from 'firebase/auth';
import { app } from '../app.client';

const auth: Auth = getAuth(app);

export { auth };

import { PUBLIC_DOMAIN_BACK, PUBLIC_PORT_BACK } from '$env/static/public';
import ioClient from 'socket.io-client';

const socket = ioClient(`ws://${PUBLIC_DOMAIN_BACK}:${PUBLIC_PORT_BACK}`);
export const io = socket;

import { PUBLIC_DOMAIN_BACK, PUBLIC_PORT_WS_BACK } from '$env/static/public';
import ioClient from 'socket.io-client';

const socket = ioClient(`http://${PUBLIC_DOMAIN_BACK}:${PUBLIC_PORT_WS_BACK}`);
export const io = socket;

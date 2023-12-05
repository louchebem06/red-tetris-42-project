import IGameStartPayload from '../interface/IGameStartPayload';
import { IMessageIncomingPayload, IMessageOutgoingPayload } from '../interface/IMessagePayload';
import IPlayerJSON from '../interface/IPlayerJSON';
import IPlayerPayload from '../interface/IPlayerPayload';
import IRoomJSON from '../interface/IRoomJSON';
import IRoomPayload from '../interface/IRoomPayload';

export type JSONPayload = IPlayerJSON | IRoomJSON | IRoomJSON[] | JSON;

export type MessagePayload = IMessageOutgoingPayload | IMessageIncomingPayload;
export type StringPayload = string | string[];
export type MainPayload = IRoomPayload | IPlayerPayload | MessagePayload | StringPayload;

export type GamePayload = IGameStartPayload;

export type Payload = JSONPayload | MainPayload | GamePayload;
export type IMIP = IMessageIncomingPayload;
export type IMOP = IMessageOutgoingPayload;

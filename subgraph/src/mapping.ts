/*
 * @Description:
 * @Autor: yjp
 * @Date: 2025-11-27 18:53:21
 * @LastEditors: yjp
 * @LastEditTime: 2025-11-27 19:00:54
 * @FilePath: /yjp-red-package/subgraph/src/mapping.ts
 */
import { BigInt } from "@graphprotocol/graph-ts";
import {
  PacketCreated,
  PacketClaimed,
  PacketFinished,
  AlreadyClaimed,
} from "../generated/RedPacket/RedPacket";
import { Packet, Claim, User } from "../generated/schema";

export function handlePacketCreated(event: PacketCreated): void {
  let packet = new Packet(event.params.packetId.toString());

  packet.packetId = event.params.packetId;
  packet.creator = event.params.creator;
  packet.totalAmount = event.params.totalAmount;
  packet.remainAmount = event.params.totalAmount;
  packet.totalCount = event.params.count;
  packet.remainCount = event.params.count;
  packet.isRandom = event.params.isRandom;
  packet.timestamp = event.params.timestamp;
  packet.isFinished = false;
  packet.createdAt = event.block.timestamp;

  packet.save();

  // 更新用户统计
  let user = User.load(event.params.creator.toHexString());
  if (user == null) {
    user = new User(event.params.creator.toHexString());
    user.address = event.params.creator;
    user.packetsCreated = [];
    user.totalClaimed = BigInt.fromI32(0);
    user.totalCreated = BigInt.fromI32(0);
  }

  let packets = user.packetsCreated;
  packets.push(packet.id);
  user.packetsCreated = packets;
  user.totalCreated = user.totalCreated.plus(event.params.totalAmount);
  user.save();
}

export function handlePacketClaimed(event: PacketClaimed): void {
  let packet = Packet.load(event.params.packetId.toString());
  if (packet == null) {
    return;
  }

  // 更新红包信息
  packet.remainAmount = packet.remainAmount.minus(event.params.amount);
  packet.remainCount = packet.remainCount.minus(BigInt.fromI32(1));
  packet.save();

  // 创建领取记录
  let claimId =
    event.params.packetId.toString() + "-" + event.params.claimer.toHexString();
  let claim = new Claim(claimId);
  claim.packet = packet.id;
  claim.claimer = event.params.claimer;
  claim.amount = event.params.amount;
  claim.timestamp = event.params.timestamp;
  claim.save();

  // 更新用户统计
  let user = User.load(event.params.claimer.toHexString());
  if (user == null) {
    user = new User(event.params.claimer.toHexString());
    user.address = event.params.claimer;
    user.packetsCreated = [];
    user.totalClaimed = BigInt.fromI32(0);
    user.totalCreated = BigInt.fromI32(0);
  }

  user.totalClaimed = user.totalClaimed.plus(event.params.amount);
  user.save();
}

export function handlePacketFinished(event: PacketFinished): void {
  let packet = Packet.load(event.params.packetId.toString());
  if (packet == null) {
    return;
  }

  packet.isFinished = true;
  packet.finishedAt = event.block.timestamp;
  packet.save();
}

export function handleAlreadyClaimed(event: AlreadyClaimed): void {
  // 这个事件主要用于前端提示，不需要在子图中处理
}

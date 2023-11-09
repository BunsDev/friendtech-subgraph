import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { Subject } from '../generated/schema';

export function createOrLoadSubject(address: Bytes): Subject {
  let subject = Subject.load(address);
  if (subject == null) {
    subject = new Subject(address);
    subject.subject = address;
    subject.earnedFees = BigInt.fromI32(0);
    subject.trades = BigInt.fromI32(0);
    subject.tradedShares = BigInt.fromI32(0);
  }

  return subject as Subject;
}

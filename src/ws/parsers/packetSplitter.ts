export function splitPackets(buffer: Buffer): Buffer[] {
  const packets: Buffer[] = [];
  let offset = 0;

  while (offset + 3 <= buffer.length) {
    const messageLength = buffer.readInt16LE(offset + 1);

    if (messageLength <= 0 || offset + messageLength > buffer.length) {
      break;
    }

    packets.push(buffer.subarray(offset, offset + messageLength));
    offset += messageLength;
  }

  return packets;
}

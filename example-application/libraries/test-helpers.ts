import amqplib from 'amqplib';
import { QueueConsumer } from '../entry-points/message-queue-consumer';
import MessageQueueClient from './message-queue-client';
import { FakeMessageQueueProvider } from './fake-message-queue-provider';

export async function startMQConsumer(
  useFake: boolean,
  customMessageQueueClient: MessageQueueClient | undefined = undefined,
): Promise<InstanceType<typeof MessageQueueClient>> {
  if (customMessageQueueClient) {
    await new QueueConsumer(customMessageQueueClient).start();
    return customMessageQueueClient;
  }
  const messageQueueProvider =
    useFake === true ? new FakeMessageQueueProvider() : amqplib;
  const newMessageQueueClient = new MessageQueueClient(messageQueueProvider);
  await new QueueConsumer(newMessageQueueClient).start();
  return newMessageQueueClient;
}

// This returns a numerical value that is 99.99% unique in a multi-process test runner where the state/DB
// is clean-up at least once a day
export function getShortUnique(): string {
  const now = new Date();
  // We add this weak random just to cover the case where two test started at the very same millisecond
  const aBitOfMoreSalt = Math.ceil(Math.random() * 99);
  return `${process.pid}${aBitOfMoreSalt}${now.getMilliseconds()}`;
}

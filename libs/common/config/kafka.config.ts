import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

export interface KafkaClientConfig {
  clientId: string;
  brokers: string[];
}

export interface KafkaConsumerConfig {
  groupId: string;
}

export interface KafkaConfig {
  client: KafkaClientConfig;
  consumer: KafkaConsumerConfig;
}

export interface KafkaTransportConfig {
  transport: Transport.KAFKA;
  options: KafkaConfig;
}

export default registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
}));

export const getKafkaClientConfig = (clientId: string): KafkaClientConfig => ({
  clientId,
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export const getKafkaConsumerConfig = (
  groupId: string,
): KafkaConsumerConfig => ({
  groupId,
});

export const getKafkaConfig = (
  clientId: string,
  groupId: string,
): KafkaConfig => ({
  client: getKafkaClientConfig(clientId),
  consumer: getKafkaConsumerConfig(groupId),
});

export const getKafkaTransportConfig = (
  clientId: string,
  groupId: string,
): KafkaTransportConfig => ({
  transport: Transport.KAFKA,
  options: getKafkaConfig(clientId, groupId),
});

import { MessageRepository } from "@/infrastructure/repositories/messaging/message-repo";
import { ConversationRepository } from "@/infrastructure/repositories/messaging/conversation-repo";
import { CustomerRepository } from "@/infrastructure/repositories/customers/customer-repo";
import type { MessageService } from "@/core/application/interfaces/messaging/message-service";
import type { ConversationService } from "@/core/application/interfaces/messaging/conversation-service";
import type { CustomerService } from "@/core/application/interfaces/customers/customer-service";
import { ReceiveMessageUseCase } from "@/core/application/usecases/messaging/receive-message";
import { SendMessageUseCase } from "@/core/application/usecases/messaging/send-message";
import { AssignConversationUseCase } from "@/core/application/usecases/messaging/assign-conversation";
import { SyncMessagesUseCase } from "@/core/application/usecases/messaging/sync-messages";
import type { MessagingAdapterFactory } from "@/core/application/interfaces/messaging/messaging-adapter";
import { getMessagingAdapterFactory } from "@/infrastructure/adapters/social/factories/messaging-adapter-factory";

// Shared repository instance creators
export const createMessageRepository = async (): Promise<MessageService> => {
  return new MessageRepository();
};

export const createConversationRepository = async (): Promise<ConversationService> => {
  return new ConversationRepository();
};

export const createCustomerRepository = async (): Promise<CustomerService> => {
  return new CustomerRepository();
};

// Shared messaging factory instance
const messagingFactoryInstance: MessagingAdapterFactory = getMessagingAdapterFactory();

// Create use case instances
export const receiveMessageUseCase = async () => {
  const messageService = await createMessageRepository();
  const conversationService = await createConversationRepository();
  const customerService = await createCustomerRepository();
  return new ReceiveMessageUseCase(messageService, conversationService, customerService, messagingFactoryInstance);
};

export const sendMessageUseCase = async () => {
  const messageService = await createMessageRepository();
  const conversationService = await createConversationRepository();
  return new SendMessageUseCase(messageService, conversationService, messagingFactoryInstance);
};

export const assignConversationUseCase = async () => {
  const conversationService = await createConversationRepository();
  return new AssignConversationUseCase(conversationService);
};

export const syncMessagesUseCase = async () => {
  const messageService = await createMessageRepository();
  const conversationService = await createConversationRepository();
  return new SyncMessagesUseCase(messageService, conversationService, messagingFactoryInstance);
};

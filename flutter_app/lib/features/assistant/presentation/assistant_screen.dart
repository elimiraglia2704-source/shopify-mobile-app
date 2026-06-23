import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

// Modello Messaggio Chat
class ChatMessage {
  final String text;
  final bool isUser;
  ChatMessage({required this.text, required this.isUser});
}

// Provider dello stato dei messaggi
final chatMessagesProvider = StateNotifierProvider<ChatNotifier, List<ChatMessage>>((ref) {
  return ChatNotifier();
});

class ChatNotifier extends StateNotifier<List<ChatMessage>> {
  ChatNotifier() : super([
    ChatMessage(text: 'Ciao! Sono Elisee, il tuo AI Stylist e Direttore Creativo. Come posso aiutarti oggi?', isUser: false)
  ]);

  final Dio _dio = Dio(BaseOptions(baseUrl: 'https://shopify-mobile-app-omega.vercel.app'));

  Future<void> sendMessage(String text) async {
    // Aggiungi il messaggio dell'utente
    state = [...state, ChatMessage(text: text, isUser: true)];

    try {
      final response = await _dio.post('/api/ai/chat', data: {
        'message': text,
        'sessionId': 'flutter_mobile_user',
        'profile': {'name': 'Utente Mobile'} // Potrebbe venire dal profileProvider
      });

      if (response.statusCode == 200) {
        final reply = response.data['reply'] as String;
        state = [...state, ChatMessage(text: reply, isUser: false)];
      } else {
        throw Exception('Server error');
      }
    } catch (e) {
      state = [...state, ChatMessage(text: 'Errore di connessione con il server AI.', isUser: false)];
    }
  }
}

class AssistantScreen extends ConsumerStatefulWidget {
  const AssistantScreen({super.key});

  @override
  ConsumerState<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends ConsumerState<AssistantScreen> {
  final TextEditingController _controller = TextEditingController();

  void _send() {
    final text = _controller.text.trim();
    if (text.isNotEmpty) {
      ref.read(chatMessagesProvider.notifier).sendMessage(text);
      _controller.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatMessagesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ELISEE AI AGENT'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final msg = messages[index];
                return Align(
                  alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: msg.isUser 
                          ? Theme.of(context).colorScheme.primary 
                          : Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(16).copyWith(
                        bottomRight: msg.isUser ? const Radius.circular(0) : null,
                        bottomLeft: !msg.isUser ? const Radius.circular(0) : null,
                      ),
                    ),
                    child: Text(
                      msg.text, // L'HTML restituito andrebbe parsato con flutter_html, per ora raw text
                      style: TextStyle(
                        color: msg.isUser ? Colors.black : Colors.white,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.surface,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Chiedi un outfit o un preventivo...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Theme.of(context).scaffoldBackgroundColor,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.black),
                    onPressed: _send,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

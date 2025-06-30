# Secret Hitler AI Edition

A digital implementation of the popular social deduction game "Secret Hitler" with AI opponents and voice chat capabilities.

## 🎮 Game Overview

Secret Hitler is a dramatic game of political intrigue and betrayal set in 1930s Germany. Each player is secretly assigned to be either a liberal fighting to stop the rise of fascism, or a fascist working to install Hitler as Chancellor. Liberals must work together to enact liberal policies, while fascists must hide their true identity and advance their agenda.

## ✨ Features

- **AI Opponents**: Play against intelligent AI with 9 different personality types
- **Voice Chat**: AI characters speak with realistic voices using ElevenLabs integration
- **Special Powers**: All four fascist powers implemented (Investigate, Special Election, Policy Peek, Execution)
- **Beautiful UI**: Modern, dark-themed interface with smooth animations
- **Multiplayer Support**: 5, 7, or 9 player games
- **Real-time Discussion**: Chat with AI opponents during discussion phases
- **Role Reveal**: Dramatic role assignment screen
- **Policy Tracking**: Visual policy boards for both parties

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SecretHitler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🎯 How to Play

### Game Setup
- Choose between 5, 7, or 9 players
- Enter your name
- Optionally enable AI chat and voice features
- Roles are secretly assigned: Liberals, Fascists, and Hitler

### Game Flow
1. **Nomination Phase**: President nominates a Chancellor
2. **Voting Phase**: All players vote on the government (Ja/Nein)
3. **Legislative Phase**: If approved, President and Chancellor enact policies
4. **Special Powers**: Fascist policies may grant special powers
5. **Discussion Phase**: Players discuss and strategize
6. **Repeat**: New President is selected, cycle continues

### Victory Conditions

**Liberals Win** by:
- Enacting 5 Liberal policies, OR
- Eliminating Hitler through execution

**Fascists Win** by:
- Enacting 6 Fascist policies, OR
- Electing Hitler as Chancellor after 3 Fascist policies

### Special Powers

When Fascist policies are enacted, the President gains special powers:

- **🔍 Investigate Loyalty**: Secretly learn another player's party affiliation
- **🗳️ Special Election**: Choose the next President
- **👁️ Policy Peek**: Look at the next 3 policies in the deck
- **💀 Execution**: Eliminate a player from the game

## 🤖 AI Personalities

The game features 9 unique AI personalities, each with distinct traits:

- **The Analyst** (Cautious): High trust, low aggression, excellent memory
- **The Prosecutor** (Aggressive): High aggression, low trust, strategic
- **The Jester** (Deceptive): High deception, unpredictable behavior
- **The Diplomat** (Trust Builder): High trust, low aggression, diplomatic
- **The Opportunist** (Flip-flopper): Medium deception, adaptable
- **The Watcher** (Quiet Observer): Low aggression, high memory, observant
- **The Doubter** (Suspicious): Low trust, high suspicion, skeptical
- **The Commander** (Overconfident): High aggression, high trust, leadership
- **The Alarmist** (Paranoid): High aggression, low trust, easily alarmed

## 🎙️ Voice Features

### Requirements
- ElevenLabs API key (optional)
- OpenAI API key (for AI chat)

### Setup
1. Get an ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io)
2. Optionally get an OpenAI API key for enhanced AI chat
3. Enter your API keys in the game settings

### Features
- AI characters speak with unique voices
- Real-time voice synthesis
- Voice announcements for special events
- Customizable voice settings

## 🛠️ Technical Details

### Built With
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **ElevenLabs API** - Voice synthesis
- **OpenAI API** - AI chat (optional)

### Project Structure
```
src/
├── components/          # React components
│   ├── GameScreen.tsx   # Main game interface
│   ├── VotingScreen.tsx # Voting interface
│   ├── SpecialPowerScreen.tsx # Special powers
│   └── ...
├── hooks/              # Custom React hooks
│   └── useGameLogic.ts # Game state management
├── utils/              # Utility functions
│   ├── aiUtils.ts      # AI behavior logic
│   ├── audioUtils.ts   # Voice features
│   └── specialPowers.ts # Special power logic
├── types/              # TypeScript type definitions
│   └── game.ts         # Game state types
└── constants/          # Game constants
```

## 🎨 Customization

### Adding New AI Personalities
Edit `src/types/game.ts` to add new personality types with custom traits.

### Modifying Game Rules
Adjust game constants in `src/types/game.ts` for different player counts and power distributions.

### Styling
The game uses Tailwind CSS for styling. Modify classes in components to change the appearance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Original Secret Hitler game by Goat, Wolf, & Cabbage
- ElevenLabs for voice synthesis technology
- OpenAI for AI chat capabilities
- The Secret Hitler community for inspiration

## 🐛 Known Issues

- Voice features require stable internet connection
- AI responses may occasionally be delayed
- Some browsers may have audio playback restrictions

## 📞 Support

If you encounter any issues or have questions:
1. Check the known issues section above
2. Review the game rules in the "How to Play" section
3. Open an issue on GitHub with detailed information

---

**Enjoy playing Secret Hitler AI Edition!** 🎭

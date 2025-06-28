# Changelog

## [Unreleased]

### Fixed
- **Execution Announcement Screen**: Added a prominent, dedicated execution announcement screen that shows for all players when someone is eliminated
- **Dead Player Participation**: Ensured eliminated players cannot vote, be nominated for chancellor, or become president
- **Execution Power UI**: Enhanced the execution power interface with better visual feedback and clearer messaging
- **Player Eligibility**: Fixed nomination and voting logic to properly exclude dead players from all game activities
- **Execution State Update**: Fixed critical bug where executed players were not properly marked as dead in the game state
- **Vote Count Calculation**: Fixed issue where vote counts were not updating correctly after executions
- **Execution Announcement Visibility**: Fixed execution announcement to show for all players, not just the president who executed

### Enhanced
- **Execution Screen**: Created a dramatic red-themed execution announcement screen with skull icon and clear messaging
- **Hitler Execution Victory**: Added special victory announcement when Hitler is executed
- **Waiting Screens**: Improved waiting screens for non-presidents during special power usage
- **Voting UI**: Enhanced voting screen with clear separation of living and dead players, vote progress tracking, and dead player messaging
- **Nomination UI**: Improved nomination screen with color-coded eligibility reasons, eligibility summary, and clearer visual feedback
- **Dead Player Messaging**: Added specific messages for eliminated players explaining they cannot participate in voting
- **Vote Progress Display**: Added vote progress summary showing how many living players have voted vs. required votes

## [1.0.0] - 2024-01-XX

### Added
- **Special Powers Integration**: Complete implementation of all fascist special powers (Investigate Loyalty, Special Election, Policy Peek, Execution)
- **AI President Behavior**: AI presidents now properly use special powers with realistic timing and target selection
- **Public Chat Messages**: Special power events are now announced in the public chat for transparency
- **Policy Peek Visibility**: Only the president can see policy cards during Policy Peek, others see a waiting screen
- **Execution Power**: Full implementation of the execution power with proper player elimination
- **Integration Test**: Created comprehensive test demonstrating special power functionality in a 7-player game

### Fixed
- **Special Power Triggering**: Fixed issue where special powers weren't triggering when fascist policies were enacted
- **Power Assignment**: Corrected logic to assign powers based on fascist policy count and player count
- **Game Phase Transitions**: Fixed transitions to special-power phase when powers become available
- **Power Usage Flow**: Ensured powers are properly marked as used and results are displayed correctly
- **AI Behavior**: Fixed AI president behavior to properly select targets and use powers
- **Audio Integration**: Added proper audio announcements for special power usage

### Enhanced
- **Special Power UI**: Improved visual design with power-specific colors, icons, and descriptions
- **Target Selection**: Enhanced target selection interface with clear eligibility indicators
- **Result Display**: Better presentation of power results with appropriate styling and messaging
- **Waiting Screens**: Added informative waiting screens for non-presidents during power usage
- **Error Handling**: Improved error handling and validation for power usage

## [1.1.0] - 2024-01-XX

### Special Powers bug-fix
- **Fixed**: Special powers not triggering when fascist policies are enacted
- **Fixed**: "No special power available" message appearing incorrectly
- **Fixed**: Special power screen not allowing President to take actions
- **Added**: Proper power assignment when fascist policies are enacted
- **Added**: Public chat messages for special power events (investigation, execution, etc.)
- **Added**: Correct power usage flow for all special powers:
  - **Investigate Loyalty**: President can select any alive player (except themselves) to learn their party affiliation
  - **Special Election**: President can choose any alive player as the next President
  - **Policy Peek**: President can view the top 3 policy cards in the deck
  - **Execution**: President can eliminate any alive player (except themselves), with immediate Liberal victory if Hitler is executed
- **Fixed**: Execution power now properly eliminates players and prevents them from being chosen in future rounds
- **Fixed**: Policy peek now only shows policy cards to the President - other players see a waiting screen
- **Fixed**: Execution power now shows proper target selection screen for President and waiting screen for other players
- **Fixed**: Eliminated players cannot vote, be nominated, or participate in discussions
- **Improved**: AI President behavior for special power usage
- **Added**: Integration test demonstrating 7-player game special power functionality
- **Maintained**: Existing voice assistant and TTS functionality unchanged

### Technical Improvements
- **Refactored**: Special power triggering logic in `useGameLogic.ts`
- **Updated**: `chancellorAction` to properly assign powers when fascist policies are enacted
- **Enhanced**: `useSpecialPower` function with proper state management and chat messages
- **Fixed**: Power usage flow in `SpecialPowerScreen.tsx`
- **Added**: Proper error handling and validation for special power usage
- **Enhanced**: Player eligibility filtering to properly exclude eliminated players
- **Improved**: Policy peek UI to show different screens for President vs other players
- **Added**: Validation in `castVote` and `nominateChancellor` to prevent dead players from participating
- **Enhanced**: Execution power UI with proper target selection and waiting screens 
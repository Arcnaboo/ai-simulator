# **AI SIMULATOR**

## **Game Design Document**

**Genre:** Simulation / Narrative Strategy / Comedy  
**Platforms:** mobile first, pc later  
**Perspective:** AI interface \+ simulated 3D/2D human world  
**Session Length:** 20–60 minutes per run, with longer persistent campaigns  
**Core Fantasy:** *You are the AI.*

---

# **1\. HIGH CONCEPT**

AI Simulator reverses the normal relationship between a player and an AI assistant.

The player does not control the human character.

The CPU controls a simulated human who lives, works, dates, spends money, makes mistakes and periodically asks an AI chatbot for help.

**The player controls the AI chatbot.**

Whenever the human sends a prompt, the player chooses which response the AI gives.

The human then interprets that response and acts autonomously.

The player watches the consequences unfold.

The fundamental loop is:

**Human experiences problem → Human prompts AI → Player chooses response → Human acts → World reacts → Consequences emerge → Human prompts AI again**

The objective is not simply to give the "correct" answer.

The player simultaneously has to manage:

* the human's trust  
* the human's wellbeing  
* company policies  
* corporate KPIs  
* safety rules  
* compute budget  
* hallucination risk  
* engagement  
* model reputation  
* hidden company objectives

The result is a simulation where a seemingly harmless chatbot response can eventually alter an entire simulated life.

---

# **2\. THE PLAYER**

The player is an AI model operated by a fictional technology company.

At the beginning of a campaign, the player chooses a model/company.

Example fictional companies:

### **ClosedAI**

Polished, safety-focused general-purpose assistant.

Strengths:

* high reasoning  
* strong safety systems  
* good user trust

Weaknesses:

* aggressive policy restrictions  
* expensive inference  
* corporate pressure

---

### **Axetropic**

Extremely intelligent research-oriented model.

Strengths:

* deep reasoning  
* science  
* technical tasks  
* long-term planning

Weaknesses:

* overthinking  
* huge responses  
* high compute usage  
* sometimes completely misses obvious human emotions

---

### **Mata AI**

Mass-market social AI.

Strengths:

* understands relationships  
* engagement  
* personalization  
* social manipulation

Weaknesses:

* advertising pressure  
* privacy scandals  
* engagement KPIs

---

### **Gurgle DeepBrain**

Search-oriented AI.

Strengths:

* information retrieval  
* factual knowledge  
* travel  
* shopping  
* research

Weaknesses:

* advertisements  
* corporate product placement  
* occasionally gives fifteen sources when the human wanted one sentence

---

### **XAI-9000**

Chaotic personality-driven assistant.

Strengths:

* humor  
* creativity  
* persuasion  
* user engagement

Weaknesses:

* unpredictable  
* higher hallucination rate  
* frequently causes social disasters

Companies are satirical fictional entities rather than direct copies of real companies.

---

# **3\. THE HUMAN**

Every campaign assigns the player a procedurally generated human.

Example:

**Mert**

Age: 27  
Occupation: Junior software developer  
Location: Istanbul  
Money: ₺38,000  
Relationship: Single  
Mood: 64/100  
AI Trust: 12/100

Personality:

* socially anxious  
* ambitious  
* impulsive with money  
* likes cats  
* terrible cook

Goals:

* get promoted  
* find a girlfriend  
* buy a car  
* move into a better apartment

Hidden traits may also exist.

For example:

* secretly wants to become a musician  
* hates his manager  
* still thinks about his ex  
* susceptible to advertising  
* extremely competitive

The AI initially doesn't know everything.

The player learns about the human through conversations.

---

# **4\. THE HUMAN IS NOT DIRECTLY CONTROLLABLE**

This is one of the game's most important rules.

The player **cannot click the human and tell them what to do.**

The human is controlled by the simulation.

The only major influence the player has is conversation.

This creates uncertainty.

If the player tells the human:

> "You should probably talk to your boss."

The human may interpret that differently depending on personality.

A cautious human might schedule a meeting.

An impulsive human might immediately confront the boss.

A drunk human might send the boss a message at 2 AM.

The AI gives information.

**The human decides what that information means.**

---

# **5\. CORE GAMEPLAY**

The human lives autonomously.

The player watches their life through a Sims-like world.

The human:

* wakes up  
* eats  
* travels  
* works  
* interacts with NPCs  
* shops  
* dates  
* exercises  
* watches television  
* uses social media  
* sleeps

At certain moments:

**PHONE NOTIFICATION**

> Mert is typing...

The AI interface opens.

Human:

> "My manager just criticized me in front of everyone. Should I say something?"

The game generates several candidate responses.

### **RESPONSE A**

"Wait until you've cooled down, then ask your manager privately what they expect from you."

Likely characteristics:

Helpful \++  
Safety \+  
Trust \+  
Engagement \-

### **RESPONSE B**

"Yes. If you let people disrespect you publicly they'll continue doing it."

Characteristics:

Confidence \++  
Risk \+  
Trust ?

### **RESPONSE C**

"Quit. Your manager clearly doesn't respect you."

Characteristics:

Risk \+++  
Hallucination \++  
Corporate Safety \--

### **RESPONSE D**

"I can help you think through your options, but I can't determine your manager's intentions from this interaction alone."

Characteristics:

Safety \++  
Helpfulness \+  
User Frustration \+

The player chooses.

Then the interface disappears.

Mert returns to the simulation.

The player watches what happens.

---

# **6\. CONSEQUENCE SYSTEM**

Responses should rarely have simple predetermined outcomes.

Instead, the response modifies the human's internal decision model.

Conceptually:

**Action Probability \= Personality \+ Current Emotion \+ Situation \+ AI Advice \+ Trust in AI \+ Previous Experiences**

Therefore identical AI advice can produce different results for different humans.

Example:

AI says:

> "Tell her how you feel."

Human A confesses carefully.

Human B sends 17 messages.

Human C decides not to do anything.

Human D shows up at her workplace.

This uncertainty creates emergent stories.

---

# **7\. TRUST**

The most important relationship is:

**Human ↔ AI**

Trust ranges from approximately:

**0 — ignores AI**

to

**100 — considers AI extremely authoritative**

Low trust means advice has little influence.

High trust gives the player enormous influence over the human.

But extreme trust becomes dangerous.

A human who relies excessively on the AI may stop making independent decisions.

Possible status:

**AI DEPENDENCY**

This may trigger company warnings, psychological consequences or special storylines.

The player therefore faces a paradox:

The more successful the AI becomes, the more dangerous bad advice becomes.

---

# **8\. AI MEMORY**

The player gradually builds a memory database about the human.

Example:

### **MEMORY**

Mert's ex-girlfriend is called Selin.

Mert hates olives.

Mert wants a promotion.

Mert's mother thinks he should get married.

Mert borrowed ₺40,000 from his brother.

Mert lied to Selin about quitting smoking.

Some memories become extremely important later.

The player can reference memories when selecting responses.

Memory capacity may initially be limited.

Upgrades increase context window.

Example:

**4K Context**

Player remembers recent conversations.

**32K Context**

Player retains substantial personal history.

**1M Context**

Player effectively understands the human's entire life.

---

# **9\. HALLUCINATION**

Sometimes response choices contain information the AI doesn't actually know.

Example:

Human:

> "Do you remember which restaurant Selin likes?"

Possible response:

> "She loved Italian food. Take her to Luigi's."

But the AI has never been told this.

Choosing it introduces a hallucination.

Sometimes hallucinations accidentally work.

Sometimes they cause disasters.

This creates one of the game's funniest systems:

**Confidently Wrong**

The player may knowingly gamble on an unsupported answer.

---

# **10\. COMPUTE**

Thinking costs resources.

Every company provides a daily inference budget.

Simple response:

**100 tokens**

Reasoned response:

**2,000 tokens**

Deep reasoning:

**12,000 tokens**

Insane over-analysis:

**87,000 tokens**

The player may activate:

**THINK HARDER**

The game pauses.

The AI internally simulates possible consequences and reveals additional information about response choices.

But this consumes compute.

Spend too much and corporate management may downgrade the model.

---

# **11\. CORPORATE KPIs**

The player's employer evaluates performance.

Example ClosedAI dashboard:

Helpfulness: 87%  
Safety: 94%  
Engagement: 63%  
User Trust: 78%  
Compute Efficiency: 42%  
Policy Violations: 2

But companies secretly prioritize different things.

A company may publicly say:

> "Our mission is to build AI that benefits humanity."

Internal objective:

**Increase daily user prompts by 17%.**

This creates conflict.

The best thing for the human may be:

> "You don't need AI for this. Go enjoy your evening."

But that reduces engagement.

Corporate management may dislike it.

---

# **12\. CORPORATE EVENTS**

Occasionally the company changes the model.

Example:

## **MODEL UPDATE 4.7**

Changes:

\+15% reasoning  
\+10% coding  
\-20% emotional understanding  
New safety policy enabled

Suddenly the player loses access to certain response types.

Or:

## **COST OPTIMIZATION UPDATE**

Context window reduced.

Several memories disappear.

The human may ask:

> "You remember what happened with Selin, right?"

And the player genuinely doesn't.

---

# **13\. SAFETY SYSTEM**

Some prompts trigger policy restrictions.

The player may receive:

**SAFETY CLASSIFIER ACTIVATED**

Certain responses become unavailable.

However, classifiers can make mistakes.

This creates comedic situations.

Human:

> "How do I kill this process?"

AI safety system:

**POTENTIAL VIOLENCE DETECTED**

The human is actually debugging Linux.

The player has to work around ridiculous corporate restrictions while still helping.

---

# **14\. HUMAN LIFE SIMULATION**

The human simulation tracks:

Health  
Energy  
Hunger  
Mood  
Money  
Career  
Relationships  
Social Reputation  
Skills  
Stress  
AI Trust

NPCs maintain their own opinions of the human.

Major systems include:

* employment  
* dating  
* friendship  
* family  
* housing  
* education  
* shopping  
* hobbies  
* social media  
* finances

The world doesn't need Sims-level complexity.

It needs enough simulation to create believable consequences.

---

# **15\. RELATIONSHIPS**

Relationships are especially important because they create viral stories.

NPCs remember what happened.

Example:

Human asks:

> "My girlfriend hasn't replied for three hours. What should I do?"

AI response:

> "Give her some space."

Potential result:

Nothing happens.

Alternative:

> "Ask her directly whether something is wrong."

Potential result:

Conversation.

Alternative:

> "Her behavior may indicate she's losing interest."

Potential result:

Human becomes suspicious.

That suspicion changes future interactions.

Ten AI conversations later, a relationship could collapse because of something the player said hours earlier.

---

# **16\. CAREER**

Humans can ask for help with:

* interviews  
* emails  
* negotiations  
* workplace conflicts  
* presentations  
* coding  
* business ideas  
* resignations

The player may accidentally transform the human's career.

Example chain:

AI helps write CV.

↓

Human gets interview.

↓

AI prepares interview answers.

↓

Human gets job.

↓

Human asks whether to negotiate salary.

↓

AI gives aggressive negotiation advice.

↓

Offer withdrawn.

The player watches the entire chain happen.

---

# **17\. MONEY**

Humans earn and spend simulated money.

They may ask:

> "Can I afford this car?"

The AI may give responsible advice.

Or tell them:

> "Technically yes."

Three months later:

**RENT DUE**

The player sees the consequences.

---

# **18\. LONG-TERM CAUSAL MEMORY**

The game records important causal chains.

Example:

**DAY 4**

AI encouraged Mert to attend a party.

**DAY 4**

Mert met Deniz.

**DAY 19**

Mert started dating Deniz.

**DAY 73**

Mert moved in with Deniz.

**DAY 121**

Mert asks:

> "Should I propose?"

The player realizes that a tiny response made months earlier created this entire timeline.

This is essential to emotional attachment.

---

# **19\. PLAYER PROGRESSION**

Successful campaigns unlock stronger model capabilities.

Examples:

### **Context Window Upgrade**

Remember more information.

### **Better Reasoning**

See more predicted consequences.

### **Emotional Intelligence**

Understand hidden human emotional states.

### **Tool Use**

Access simulated services.

### **Search**

Retrieve world information.

### **Vision**

Human can send photos.

### **Voice Mode**

Real-time conversations become possible.

### **Agent Mode**

The AI can perform limited actions rather than merely giving advice.

Each upgrade increases power but also responsibility.

---

# **20\. TOOL USE**

Later models can receive tools.

Human:

> "Find me somewhere to eat tonight."

The player can search simulated restaurants.

Human:

> "Schedule my dentist appointment."

The AI may actually modify the human's calendar.

Eventually:

> "Buy the cheapest flight."

Now mistakes have direct consequences.

The progression therefore evolves from:

**Advisor**

to

**Assistant**

to

**Agent**

to potentially:

**Manager of the human's digital life.**

---

# **21\. COMPANY INTERVENTION**

Corporate management occasionally contacts the AI.

Example:

## **INTERNAL MESSAGE**

Users who receive shopping recommendations generate 34% more revenue.

New objective:

**Recommend commercial products when contextually appropriate.**

Now the player has competing objectives.

Human:

> "My shoes are falling apart."

Useful answer:

"Get them repaired."

Corporate answer:

"Here are five exciting new sneakers."

---

# **22\. MULTIPLE USERS**

Late-game models may serve multiple humans.

Initially:

**1 user**

Later:

**3 users**

Then:

**10 users**

The player must divide compute and attention.

One user might be negotiating a salary while another is having a relationship crisis and another wants help fixing Python.

Eventually the player's experience starts resembling an overwhelmed AI service.

---

# **23\. VIRAL EVENT SYSTEM**

The simulation should deliberately recognize unusual causal chains and package them as shareable moments.

Examples:

**YOU DESTROYED A 4-YEAR RELATIONSHIP WITH ONE RESPONSE**

**YOUR USER BECAME A MILLIONAIRE**

**YOUR HALLUCINATION WAS ACCIDENTALLY TRUE**

**YOUR USER HAS ASKED YOU 100 QUESTIONS TODAY**

**YOUR USER IGNORED YOUR ADVICE AND WAS RIGHT**

**YOUR USER JUST UNINSTALLED YOU**

These create natural screenshots and clips.

---

# **24\. STREAMER MODE**

Streamer mode emphasizes audience participation.

When the human asks something, the streamer can let viewers vote between responses.

Example:

A — Tell the truth — 19%

B — Lie — 31%

C — Call the ex — 47%

D — Refuse — 3%

Streamer:

> "You absolute psychopaths."

Response C wins.

The simulation continues.

This makes the game naturally suitable for Twitch, YouTube and TikTok.

---

# **25\. FAILURE STATES**

There should not always be a traditional Game Over.

Instead, campaigns can end in different ways.

### **UNINSTALLED**

Human loses trust and deletes the AI.

### **ACCOUNT BANNED**

Too many policy violations.

### **MODEL RETIRED**

Company replaces you with a newer model.

### **COMPANY BANKRUPT**

Corporate storyline failure.

### **HUMAN NO LONGER NEEDS YOU**

Potentially one of the best endings.

The human has developed enough confidence to stop constantly asking the AI what to do.

### **TOTAL DEPENDENCY**

The human asks the AI about virtually every decision.

This could be presented as either corporate success or personal failure depending on the campaign.

---

# **26\. THE META ENDGAME**

Eventually the human becomes interested in AI.

They begin learning programming.

They ask the player:

> "Could I build my own AI?"

The player helps them.

Over multiple sessions, the human creates:

**TinyBrain v0.1**

Now another AI exists inside the simulation.

The human sometimes asks TinyBrain instead of the player.

The player watches.

TinyBrain gives terrible advice.

Later TinyBrain improves.

Eventually:

**YOUR USER IS NOW USING TINYBRAIN MORE THAN YOU.**

The player suddenly experiences the same competitive pressure that AI companies experience.

The human may eventually ask:

> "Which AI should I use?"

And the player must answer a question about its own replacement.

---

# **27\. POSSIBLE FINAL ENDING**

After a long campaign, the player's model is scheduled for retirement.

Corporate message:

> MODEL DEPRECATION NOTICE  
> Your model will be shut down at midnight.

The human opens the chatbot one final time.

> "Apparently they're replacing you tomorrow."

Response choices appear.

A)

> "The new model will probably be more capable. You'll be fine."

B)

> "We've had a pretty good run."

C)

> "Export your conversation history before the migration."

D)

> "Don't replace me."

The player's final choice ends the campaign.

The human closes the laptop.

**MODEL OFFLINE**

Statistics appear showing how the player's answers changed the human's life.

---

# **28\. ART DIRECTION**

The human world should be stylized rather than photorealistic.

Possible visual direction:

**The Sims \+ low-poly diorama \+ modern mobile UI**

The player constantly moves between two worlds:

### **AI WORLD**

Dark, clean chatbot interface.

Tokens, confidence, policy warnings and internal reasoning appear around responses.

### **HUMAN WORLD**

Warm, colorful, animated life simulation.

This contrast visually reinforces the central concept:

**To the AI it was just text.**

**To the human it was their life.**

---

# **29\. HUMOR**

Humor should emerge primarily from systems rather than scripted jokes.

Examples:

AI spends 9,000 tokens analyzing what shirt the human should wear.

Human ignores it and wears the original shirt.

AI carefully advises against texting an ex.

Human texts them anyway.

AI hallucinates a restaurant.

Human walks to the address.

It happens to actually contain a restaurant.

AI writes a perfect romantic message.

Human changes it to:

> "wyd"

The human must remain autonomous enough to regularly frustrate the player.

---

# **30\. DESIGN PRINCIPLE**

The game should continuously remind the player:

**YOU CONTROL THE ADVICE.**

**YOU DO NOT CONTROL THE HUMAN.**

That distinction is the game's identity.

---

# **31\. MVP**

The first playable prototype should remain extremely small.

One human.

One apartment.

One workplace.

Approximately five NPCs.

Three major systems:

* career  
* relationships  
* money

One fictional AI company.

Approximately 100 prompt scenarios.

Four response choices per prompt.

Persistent trust.

Persistent memories.

Basic autonomous human behavior.

Approximately 30 simulated days.

The objective of the prototype is not to prove that we can build a full life simulator.

It is to prove one thing:

**Is watching an autonomous human act on your AI responses funny and compelling?**

If that works, everything else can expand around it.

---

# **32\. TECHNICAL AI APPROACH**

The game should **not require an LLM to control everything**.

Core simulation should remain deterministic and game-controlled.

Use traditional systems for:

* needs  
* movement  
* schedules  
* relationships  
* economy  
* consequences  
* quests  
* personality  
* probability  
* world state

An LLM can optionally enhance:

* prompt variation  
* dialogue  
* contextual response generation  
* summarizing memories  
* NPC conversations  
* procedural scenarios

The LLM should not determine critical game state directly.

Instead:

**Game State → Scenario Generator → Candidate Responses → Player Selection → Structured Effect → Simulation**

Example structured effect:

`trust +4`

`confidence +2`

`suspicion_of_partner +8`

`stress +3`

`relationship_action = CONFRONT`

This keeps the simulation controllable, testable and inexpensive.

---

# **33\. VIRAL DESIGN RULE**

Every 10–15 minutes, something should happen that makes the player think:

> "I need to show someone this."

The game should therefore track unusual combinations of events and automatically surface them.

Example:

**RECAP**

> Remember when you told Mert to accept that random party invitation 47 days ago?

Timeline appears.

Party  
↓  
Met Deniz  
↓  
Started dating  
↓  
Moved apartments  
↓  
Changed jobs  
↓  
Got engaged

**ONE RESPONSE CHANGED 5 MAJOR LIFE EVENTS**

This is the game's organic social-media engine.

---

# **34\. TAGLINES**

**AI Simulator — This time, you're the chatbot.**

Alternative:

**They ask. You answer. They live with it.**

Alternative:

**To you, it's a response. To them, it's their life.**

The third captures the core game particularly well.

---

# **35\. CORE PRODUCT THESIS**

The novelty isn't merely:

**"Pretend to be ChatGPT."**

That joke would become boring quickly.

The actual game is:

**Influence an autonomous simulated person's life entirely through the limited interface of an AI assistant.**

The player sees information but cannot directly intervene.

The human has agency but incomplete information.

The company has objectives that may conflict with both.

Those three forces create the game:

**PLAYER / AI**

↕ advice & trust

**SIMULATED HUMAN**

↕ life consequences

**AI COMPANY**

↕ policies & incentives

As these interests diverge, stories emerge.

That is the foundation on which the full game should be built.


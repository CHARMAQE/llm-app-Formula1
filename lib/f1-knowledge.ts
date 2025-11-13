export const f1KnowledgeBase = {
  teams: {
    title: "Current Formula 1 Teams (2024 Season)",
    content: `The 2024 Formula 1 season features 10 teams:

🔴 **Red Bull Racing** - Max Verstappen & Sergio Pérez
🖤 **Mercedes-AMG** - Lewis Hamilton & George Russell  
🔴 **Ferrari** - Charles Leclerc & Carlos Sainz Jr.
🧡 **McLaren** - Lando Norris & Oscar Piastri
💚 **Aston Martin** - Fernando Alonso & Lance Stroll
🔵 **Alpine** - Esteban Ocon & Pierre Gasly
🔵 **Williams** - Alex Albon & Logan Sargeant
🔵 **AlphaTauri** - Yuki Tsunoda & Daniel Ricciardo
💚 **Alfa Romeo** - Valtteri Bottas & Zhou Guanyu
⚪ **Haas** - Kevin Magnussen & Nico Hülkenberg

Each team fields two drivers and competes for both the Drivers' Championship (individual) and Constructors' Championship (team).`
  },
  
  drivers: {
    title: "Notable Formula 1 Drivers",
    content: `Key drivers to watch in Formula 1:

🏆 **Max Verstappen** (Red Bull) - Current World Champion, known for aggressive racing style
🏆 **Lewis Hamilton** (Mercedes) - 7-time World Champion, racing legend
🏆 **Charles Leclerc** (Ferrari) - Fast and talented, Ferrari's future star
🏁 **Lando Norris** (McLaren) - Young British talent with growing success
🏁 **Fernando Alonso** (Aston Martin) - Two-time World Champion, veteran racer
🏁 **George Russell** (Mercedes) - Rising star, Hamilton's teammate

These drivers represent the top talent in modern Formula 1, each bringing unique skills and racing styles to the sport.`
  },
  
  champions: {
    title: "F1 Championship Winners",
    content: `🏆 **2024 Formula 1 Championship**

**Drivers' World Championship:**
🥇 **Max Verstappen** (Red Bull Racing) - 2024 World Champion
The Dutch driver secured his fourth consecutive drivers' championship, continuing his dominant era in Formula 1.

**Constructors' Championship:**
🏆 **Red Bull Racing** - 2024 Constructors' Champions
Red Bull maintained their position at the top of the team standings.

**Recent Champions History:**
• **2023**: Max Verstappen (Red Bull)
• **2022**: Max Verstappen (Red Bull)
• **2021**: Max Verstappen (Red Bull)
• **2020**: Lewis Hamilton (Mercedes)
• **2019**: Lewis Hamilton (Mercedes)

**All-Time Records:**
• **Most Titles (Driver)**: Lewis Hamilton & Michael Schumacher (7 titles each)
• **Most Titles (Constructor)**: Ferrari (16 titles)
• **Current Era**: Max Verstappen's dominance continues with Red Bull Racing

The 2024 season showcased exceptional racing with Max Verstappen proving his status as one of the sport's all-time greats.`
  },

  scoring: {
    title: "F1 Points Scoring System",
    content: `Formula 1 uses the following points system:

🥇 **1st Place**: 25 points
🥈 **2nd Place**: 18 points  
🥉 **3rd Place**: 15 points
**4th Place**: 12 points
**5th Place**: 10 points
**6th Place**: 8 points
**7th Place**: 6 points
**8th Place**: 4 points
**9th Place**: 2 points
**10th Place**: 1 point

⚡ **Fastest Lap**: +1 point (if finishing in top 10)

Both individual drivers and teams accumulate points throughout the season for their respective championships.`
  },
  
  rules: {
    title: "F1 Technical Regulations",
    content: `Key Formula 1 technical rules include:

🚗 **Engines**: 1.6L turbocharged V6 hybrid power units
⚡ **Power**: ~1000 horsepower with energy recovery systems
⚖️ **Weight**: Minimum 798kg including driver
🏎️ **Aerodynamics**: Strict regulations on wings, floor, and body design
🛡️ **Safety**: Mandatory halo cockpit protection system
⛽ **Fuel**: Maximum 110kg per race, no refueling allowed
🔧 **Tires**: Pirelli compounds (hard, medium, soft) with mandatory pit stops

These regulations ensure fair competition while maintaining the technological excellence F1 is known for.`
  },
  
  news: {
    title: "Latest Formula 1 Developments",
    content: `🏆 **Championship Battle 2024**
The current F1 season features intense competition between multiple teams. Red Bull continues to show strong performance with Max Verstappen leading championship standings.

� **Team Performance Updates**
• **Red Bull Racing**: Maintaining competitive edge with aerodynamic developments
• **Mercedes**: Showing improvement with recent car upgrades  
• **Ferrari**: Working on consistency and race strategy optimization
• **McLaren**: Demonstrating strong pace in recent races

🌍 **Global Formula 1 Growth**
F1 continues expanding worldwide with:
• Growing fanbase in North America and Asia
• Increased social media engagement and streaming viewership
• New partnerships and technological innovations
• Enhanced sustainability initiatives toward carbon neutrality by 2030

⚡ **Technical Developments**
Teams constantly developing aerodynamic and power unit improvements throughout the season, with each race weekend bringing new updates and strategies.

🏁 **Upcoming Highlights**
Formula 1 maintains its position as the pinnacle of motorsport with cutting-edge technology, thrilling wheel-to-wheel racing, and global entertainment appeal.`
  }
};

export function getRelevantF1Info(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Prioritize championship winner queries
  if ((lowerQuery.includes('who won') || lowerQuery.includes('winner') || lowerQuery.includes('champion')) && 
      (lowerQuery.includes('2024') || lowerQuery.includes('2023') || lowerQuery.includes('current') || lowerQuery.includes('championship'))) {
    return f1KnowledgeBase.champions.content;
  }
  
  // Prioritize news queries
  if (lowerQuery.includes('news') || lowerQuery.includes('latest') || lowerQuery.includes('recent') || lowerQuery.includes('update')) {
    return f1KnowledgeBase.news.content;
  }
  // Match keywords to topics  
  if (lowerQuery.includes('team') || lowerQuery.includes('constructor')) {
    return f1KnowledgeBase.teams.content;
  }
  if (lowerQuery.includes('driver') || lowerQuery.includes('pilot') || lowerQuery.includes('racer')) {
    return f1KnowledgeBase.drivers.content;
  }
  if (lowerQuery.includes('point') || lowerQuery.includes('score') || lowerQuery.includes('scoring')) {
    return f1KnowledgeBase.scoring.content;
  }
  if (lowerQuery.includes('rule') || lowerQuery.includes('regulation') || lowerQuery.includes('technical')) {
    return f1KnowledgeBase.rules.content;
  }
  
  // Default fallback to news for general queries
  return f1KnowledgeBase.news.content;
}

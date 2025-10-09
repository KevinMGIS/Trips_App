# Quick Start Guide: New Itinerary Features

## 🎯 Three Powerful Views for Your Trip Planning

### 1️⃣ Cards View (Default)
**Best for:** Daily planning and organization

```
┌─────────────────────────────────────────┐
│  Day 1                         [3 items]│
│  Monday, October 10                    ▼│
├─────────────────────────────────────────┤
│  ⋮⋮ ✈️ Flight to Paris        09:00 AM │
│  ⋮⋮ 🏨 Hotel Check-in         03:00 PM │
│  ⋮⋮ 🍽️ Dinner Reservation     07:00 PM │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Day 2                         [2 items]│
│  Tuesday, October 11                   ▶│ (Collapsed)
└─────────────────────────────────────────┘
```

**Features:**
- Click day headers to expand/collapse
- Drag ⋮⋮ handle to reorder or move to another day
- See daily activity count and cost at a glance
- Use "Expand All" / "Collapse All" buttons

### 2️⃣ Timeline View (Gantt Chart)
**Best for:** Visual overview of entire trip

```
              Day 1    Day 2    Day 3    Day 4
             ┌────────┬────────┬────────┬────────┐
Flight       │ ✈️ JFK→│        │        │        │
             │   CDG  │        │        │        │
             ├────────┼────────┼────────┼────────┤
Hotels       │        │🏨 Marriott Paris ▬▬▬▬▬▬▶│
             │        │        │        │        │
             ├────────┼────────┼────────┼────────┤
Activities   │        │📷 Eiffel│🎨 Louvre│        │
             │        │  Tower │ Museum │        │
             └────────┴────────┴────────┴────────┘
```

**Features:**
- Color-coded by category (flights blue, hotels green, etc.)
- Multi-day items span across columns
- Click any block to edit the activity
- Horizontal scroll for longer trips
- Category legend with item counts

### 3️⃣ List View
**Best for:** Detailed chronological planning

```
Day 1 - Monday, October 10
├─ 09:00 AM  ✈️ Flight to Paris
├─ 03:00 PM  🏨 Hotel Check-in  
└─ 07:00 PM  🍽️ Dinner Reservation

Day 2 - Tuesday, October 11
├─ 10:00 AM  📷 Eiffel Tower Visit
└─ 02:00 PM  🎨 Louvre Museum Tour
```

**Features:**
- Chronological order by day
- Drag to reorder within or between days
- See all details at once
- Traditional itinerary format

---

## 🎮 How to Switch Views

Look for the toggle buttons in the top-right of the Itinerary tab:

```
┌───────────────────────────────────────────────┐
│                                    [Cards]    │
│  Trip Timeline                     [Timeline] │
│                                    [List]     │
│                            [+ Add Activity]   │
└───────────────────────────────────────────────┘
```

Click any button to instantly switch views!

---

## 🎯 Cross-Day Dragging Tutorial

### Before:
```
Day 1
├─ Morning: Flight arrival
├─ Afternoon: Museum visit  ← Want to move this!
└─ Evening: Dinner

Day 2
└─ Morning: Free time
```

### How to Move:
1. **Hover** over the activity → ⋮⋮ handle appears
2. **Click and hold** the ⋮⋮ handle
3. **Drag** up or down to any day
4. **Release** to drop

### After:
```
Day 1
├─ Morning: Flight arrival
└─ Evening: Dinner

Day 2
├─ Morning: Free time
└─ Afternoon: Museum visit  ← Moved! Date auto-updated!
```

✨ **Magic:** The date automatically changes to match the new day!

---

## 💡 Pro Tips

### Planning Your Trip
1. Start with **Timeline View** to see the big picture
2. Switch to **Cards View** to organize day-by-day
3. Use **List View** for final review before departure

### During Your Trip
1. Use **Cards View** and collapse all but today
2. Check **Timeline View** to see what's coming up
3. Drag activities if plans change on the fly

### Group Planning
1. Share **Timeline View** for overview discussions
2. Use **Cards View** for day-by-day planning sessions
3. **List View** is great for printing or emails

---

## 🎨 Understanding Colors

Each activity type has its own color for quick identification:

- **🔵 Blue** = Flights & Air Travel
- **🟢 Green** = Hotels & Accommodations  
- **🟣 Purple** = Ground Transportation
- **🟠 Orange** = Activities & Tours
- **🩷 Pink** = Restaurants & Dining
- **⚪ Gray** = Other/Miscellaneous

Colors appear in:
- Activity cards and borders
- Timeline/Gantt chart blocks
- Category icons
- Legend indicators

---

## ⚡ Keyboard Shortcuts & Gestures

### Mouse/Trackpad:
- **Click day header** → Expand/collapse day
- **Drag handle** → Reorder items
- **Click activity** → Edit details
- **Hover** → Reveal action buttons

### Mobile/Touch:
- **Tap day header** → Expand/collapse day
- **Touch & hold handle** → Start dragging
- **Swipe** → Scroll through timeline

---

## 🆘 Common Questions

**Q: Can I move an activity to a different day?**
A: Yes! Just drag the activity using the ⋮⋮ handle to any day. The date updates automatically.

**Q: What happens to the time when I move to another day?**
A: The original time is preserved. If it was 2:00 PM on Monday, it'll be 2:00 PM on Tuesday.

**Q: Which view should I use?**
A: Use Cards for daily planning, Timeline for overview, List for detailed review. Switch anytime!

**Q: Can I print or export this?**
A: Not yet, but PDF export is coming soon! For now, you can take screenshots.

**Q: Do changes save automatically?**
A: Yes! All drag-and-drop changes save to the database immediately.

**Q: Can other people see my view preference?**
A: No, view selection is personal and doesn't affect others.

---

## 🚀 Next Steps

Ready to plan your perfect trip? Here's what to do:

1. ✅ Go to your trip's Itinerary tab
2. ✅ Add some activities if you haven't already
3. ✅ Try switching between the three views
4. ✅ Experiment with dragging items around
5. ✅ Find your favorite view and start planning!

---

**Need help?** Check the full documentation in `ITINERARY_ENHANCEMENTS.md`

**Found a bug?** Let us know so we can fix it!

**Have ideas?** We'd love to hear them for future updates!

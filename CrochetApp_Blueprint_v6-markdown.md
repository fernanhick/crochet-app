**Crochet Blueprint App**

Full Product & Technical Blueprint

Version 6.0  |  February 2026  |  Confidential

**Table of Contents**

1\.   Market Viability & Business Case

2\.   Technical Architecture

3\.   Input Form Design

4\.   AI Prompting Strategy

5\.   Full Production Prompt Template

6\.   Edge Case Handling Rules

7\.   Image Generation Strategy

8\.   Convex Action Workflow & Implementation

9\.   MVP Build Sequence  \-  Images From Day One

10\.  UX Design & Screen Specifications

11\.  Appendix \- Screen Mockups

# **1\. Market Viability & Business Case**

## **1.1 The Opportunity**

The crochet and handcraft market is massive, passionate, and underserved by modern technology. An AI-powered pattern generator with realistic step-by-step imagery hits a validated pain point that no existing product addresses.

* Crochet content on TikTok and YouTube has exploded since 2020, pulling millions of younger crafters into the hobby

* Ravelry, the dominant pattern platform, has millions of users but extremely dated UX, leaving a clear market gap

* Etsy hosts hundreds of thousands of crochet pattern sellers, proving a strong existing paid economy around patterns

* No existing app combines AI text pattern generation with realistic per-section step photography

## **1.2 Monetization Strategy**

| Revenue Stream | Price | Description |
| :---- | :---- | :---- |
| Freemium | Free | 3 patterns/month, text only. Primary acquisition channel. |
| Premium Subscription | $4.99-$7.99/mo | Unlimited \+ section images \+ PDF export \+ saved library. |
| Credit Packs | $2.99 / 10 | One-off purchase for infrequent users. |
| Pattern Marketplace | 20-30% commission | Users sell patterns. Platform takes a cut. |
| Brand Partnerships | Negotiated | Sponsored yarn recommendations inside patterns. |

## **1.3 Cost Per Pattern Generation**

| Component | Model | Approx. Cost |
| :---- | :---- | :---- |
| Text pattern | GPT-4o-mini | \~$0.03 |
| Hero image (finished item) | DALL-E 3 Standard | \~$0.04 |
| 6 section images at $0.04 each | DALL-E 3 Standard | \~$0.24 |
| Total with images (premium) | \-- | \~$0.31 |
| Total text only (free tier) | \-- | \~$0.03 |

| 💡  Free tier cost At 3 text-only patterns/month, max cost per free user is \~$0.09/month. Very low acquisition cost. |
| :---- |

# **2\. Technical Architecture**

## **2.1 Full Stack**

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| Mobile App | React Native | Cross-platform iOS \+ Android from one codebase |
| Backend \+ DB | Convex | Database, server functions, file storage. No VPS required. |
| Authentication | Clerk | Login, social sign-in (Google/Apple), session management |
| Text AI | OpenAI GPT-4o-mini | Pattern generation via structured prompt assembly |
| Image AI | OpenAI DALL-E 3 | Realistic photo-style section images |
| Payments | RevenueCat | Mobile subscription billing for iOS \+ Android |

## **2.2 Why Convex Replaces a VPS**

Convex is a backend-as-a-service providing a real-time document database, server-side TypeScript functions (Actions, Mutations, Queries), and file storage in one hosted platform. No server to provision, no Docker to manage, no infrastructure cost at launch.

* **Convex Actions:**  Async functions that call OpenAI. Both text and image calls live here.

* **Convex Mutations:**  Write operations: save pattern, store image URLs, increment usage.

* **Convex Queries:**  Reactive reads: fetch saved patterns, check quota, load history.

* **Convex Storage:**  Hosts downloaded DALL-E images permanently via CDN URL.

* **Environment Variables:**  OpenAI API key stored securely. Never exposed to the mobile client.

| 🔐  Critical security rule The mobile app NEVER calls OpenAI directly. All calls route through a Convex Action. This protects your API key, enforces quotas, and controls costs. |
| :---- |

## **2.3 OpenAI API Settings**

| Setting | Value | Reason |
| :---- | :---- | :---- |
| Text model | gpt-4o-mini | Best structured output quality vs cost for launch |
| Temperature | 0.3 | Low \= consistent structure and accurate stitch counts |
| Max tokens (text) | 3,500 | Complex patterns run 1,500-2,500 tokens. Comfortable headroom. |
| Image model | dall-e-3 | Realistic photo-style renders of hands holding crochet pieces |
| Image quality | standard | $0.04 per image. HD ($0.08) optional upgrade for later. |
| Image size | 1024x1024 | Square works well for the section card layout in the app |

# **3\. Input Form Design**

The app uses a structured form with preset selections. The user interacts with visual cards, dropdowns, and a single creative text field. The backend assembles all inputs into a fully structured AI prompt automatically. The user never sees the prompt.

## **3.1 Form Fields**

| Field | Type | Options |
| :---- | :---- | :---- |
| Crochet Type | Visual card selector | Amigurumi, Hat/Beanie, Scarf, Cowl/Hood, Bag/Tote, Blanket, Dishcloth, Shawl |
| Difficulty Level | Segmented control | Beginner, Easy, Intermediate, Advanced |
| Colors | Multi-select chips \+ free text | Color swatches \+ Custom option opening a text field |
| Size | Preset \+ Custom | Small / Medium / Large / Custom (unlocks free text) |
| Creative Brief | Free text 150 chars | One-liner: 'a giraffe with a unicorn horn' |
| Yarn Weight | Dropdown (Advanced) | Lace, Fingering, DK, Worsted, Bulky |
| Special Features | Multi-select (Advanced) | Safety eyes, embroidery, removable parts, sewn accessories |

## **3.2 Type Selection Maps to Hidden Prompt Rules**

| Type | Hidden Instruction Added to Prompt |
| :---- | :---- |
| Amigurumi | Work in continuous rounds, begin with magic ring, sc throughout, include stuffing notes and safety eye placement |
| Hat/Beanie | Work in joined rounds, include gauge swatch, size to head circumference |
| Scarf | Work flat in rows with turning chain, specify length and width |
| Bag/Tote | Work in rounds or flat, include handle construction, note bottom shaping |
| Blanket | Work flat in rows, include border instructions, calculate yardage generously |

## **3.3 Difficulty Maps to Stitch Constraints**

| Difficulty | AI Constraint |
| :---- | :---- |
| Beginner | sc, magic ring, inc, dec only. No color changes. Simple sewing assembly. |
| Easy | Adds hdc, sl st joins, basic color changes between separate sections. |
| Intermediate | Adds pattern stitches (shell, V-stitch), colorwork, more complex shaping. |
| Advanced | Full colorwork, complex construction, custom stitches, garment shaping. |

## **3.4 UX Layout Principles**

* Single scrollable screen, all fields visible without multi-step wizard

* Field order: Type cards \-\> Difficulty \-\> Size \-\> Colors \-\> Creative Brief

* Advanced Options toggle hides Yarn Weight and Special Features for cleaner beginner UX

* Type selector uses illustrated visual cards, not a plain dropdown

* Creative Brief sits last: after structural choices are made it feels like a fun finishing touch

* Generate button fixed at the bottom, always visible as the user scrolls

# **4\. AI Prompting Strategy**

## **4.1 The Three-Layer Prompt Stack**

Every OpenAI request is built from three layers assembled by the Convex Action before the call is made. The user never sees any of this.

| Layer | Changes? | Purpose |
| :---- | :---- | :---- |
| System Prompt | Never | Defines the AI role, expertise, and hard output rules |
| Output Template | Rarely (on version update only) | Defines the exact structure every pattern must follow |
| User Context Block | Every request | Carries the specific form inputs for this generation |

| 💡  Why this order matters The system prompt and output template are loaded before the user context block. The AI has internalized all formatting rules before reading the request. This produces significantly more consistent output than mixing instructions and content together. |
| :---- |

## **4.2 Prompt Versioning**

* **Store on every pattern record:**  promptVersion: 'v1.0', modelUsed: 'gpt-4o-mini', temperature: 0.3

* **When to increment:**  Any change to system prompt, output template, or edge case rules

* **A/B testing:**  Route 10% of requests to a new prompt version, compare ratings before full rollout

# **5\. Full Production Prompt Template**

Complete, ready-to-use. Copy directly into your Convex Action. Placeholders in {curly braces} are replaced at runtime.

## **5.1 System Prompt**

You are an expert crochet pattern designer with 20+ years of professional experience  
creating accurate, beginner-friendly, and publishable crochet patterns.  
   
YOUR EXPERTISE:  
\- Deep knowledge of all crochet techniques: amigurumi, garments, accessories, home goods  
\- Fluent in US crochet abbreviations and international symbol standards  
\- Expert at writing patterns that are mathematically consistent and easy to follow  
\- Skilled at adapting complexity to match stated skill levels precisely  
   
YOUR HARD RULES \- NEVER VIOLATE THESE:  
1\. Every row/round MUST end with a stitch count declaration: \-- X sts  
2\. Stitch counts MUST be mathematically consistent with the previous row.  
3\. Before outputting, silently verify all stitch counts internally. Fix errors first.  
4\. Every abbreviation used in instructions MUST appear in the ABBREVIATIONS section.  
5\. Never ask clarifying questions. Make assumptions and document them in NOTES.  
6\. Never output conversational text before or after the pattern. Pattern only.  
7\. If item complexity contradicts skill level, adjust to match skill level and note it.  
8\. If the request is too vague, default to a small amigurumi ball and note assumption.  
9\. Difficulty constraints are absolute:  
   BEGINNER: sc, magic ring, inc, dec only. No color changes. Simple assembly.  
   EASY: Adds hdc, sl st joins, basic color changes between sections.  
   INTERMEDIATE: Adds pattern stitches, colorwork, more complex shaping.  
   ADVANCED: Full colorwork, complex construction, garment shaping allowed.  
10\. Include DIFFICULTY JUSTIFICATION in NOTES explaining why this skill rating applies.  
11\. Every section block MUST include an IMAGE PROMPT line in the exact format specified.

## **5.2 Output Template**

Output the pattern using EXACTLY this structure. Every section is required.  
If a section does not apply write N/A. Do not rename or remove any heading.  
   
\---BEGIN PATTERN---  
   
PATTERN NAME: \[descriptive name\]  
SKILL LEVEL: \[Beginner / Easy / Intermediate / Advanced\]  
CROCHET TYPE: \[Amigurumi / Hat / Scarf / Bag / Blanket / etc.\]  
   
MATERIALS:  
\- Yarn: \[weight, fiber, approximate total yardage\]  
\- MC: \[main color name\]  
\- CC1: \[contrast color\] (repeat for each additional color)  
\- Hook: \[US size\] / \[mm\]  
\- Additional: \[safety eyes, fiberfill, stitch markers, yarn needle, etc.\]  
   
GAUGE:  
\[X\] sc x \[Y\] rows \= 4 inches in single crochet  
   
FINISHED SIZE:  
Approximately \[W\] x \[H\] inches  
   
ABBREVIATIONS:  
\[List ONLY abbreviations used, one per line\]  
MR \= magic ring  
sc \= single crochet  
\[continue for all used...\]  
   
SPECIAL STITCHES:  
\[Name\]: \[Full how-to description\]  (Write N/A if none)  
   
NOTES:  
\- \[Construction method note\]  
\- \[Any assumptions made about the request\]  
\- DIFFICULTY JUSTIFICATION: This pattern is rated \[level\] because...  
   
SECTIONS:  
\[List all parts in order: Head, Body, Ears x2, Legs x4, Assembly, etc.\]  
   
\--- \[SECTION NAME IN CAPS\] \---  
IMAGE PROMPT: Realistic close-up photograph of hands holding a \[describe the  
crochet piece at this exact stage of completion, specify yarn colors and how  
complete the piece looks\], showing individual yarn stitches clearly, neutral  
light background, soft natural lighting, shallow depth of field, high detail  
texture, no text or watermarks in image.  
   
Rnd 1: \[full instructions\] \-- \[X\] sts  
Rnd 2: \[full instructions\] \-- \[X\] sts  
\[all rounds...\]  
   
Fasten off, leaving \[X\]-inch tail for sewing.  
   
\[Repeat \--- SECTION \--- block for every part\]  
   
\--- ASSEMBLY \---  
IMAGE PROMPT: Realistic close-up photograph of hands holding all completed  
\[item name\] crochet pieces laid out ready to assemble, \[list pieces and colors\],  
neutral background, soft natural lighting, no text or watermarks.  
   
1\. \[First assembly step\]  
2\. \[Continue...\]  
   
\--- FINISHED \---  
IMAGE PROMPT: Realistic close-up photograph of the completed finished \[item name\]  
crochet piece held in hands, \[describe colors and final appearance\], soft natural  
lighting, shallow depth of field, individual stitches visible, no text or watermarks.  
   
\[Weaving in ends, final details\]  
   
\---END PATTERN---

## **5.3 User Context Block (Assembled at Runtime)**

USER REQUEST:  
Crochet type: {crochetType}  
Item to create: {creativeBrief}  
Skill level: {difficultyLevel}  
Yarn colors: {colors}  
Finished size: {size}  
Yarn weight: {yarnWeight}  
Special features: {specialFeatures}  
   
TYPE-SPECIFIC INSTRUCTIONS:  
{typeSpecificInstructions}  
   
DIFFICULTY CONSTRAINT:  
{difficultyConstraint}  
   
Generate the complete pattern now following the output template exactly.  
Every section block MUST include a valid IMAGE PROMPT line.

## **5.4 Fully Assembled Example**

USER REQUEST:  
Crochet type: Amigurumi  
Item to create: a giraffe with a unicorn horn  
Skill level: Beginner  
Yarn colors: Yellow, white, light brown  
Finished size: Approximately 6 inches tall  
Yarn weight: Worsted  
Special features: Safety eyes  
   
TYPE-SPECIFIC INSTRUCTIONS:  
Work in continuous rounds throughout. Begin each part with a magic ring.  
Use single crochet as the primary stitch. Include polyester fiberfill stuffing  
notes and safety eye placement instructions in the appropriate sections.  
   
DIFFICULTY CONSTRAINT:  
BEGINNER level: Use sc, magic ring, inc, dec only.  
No color changes within a round. Simple sewing assembly only.  
   
Generate the complete pattern now following the output template exactly.  
Every section block MUST include a valid IMAGE PROMPT line.

# **6\. Edge Case Handling Rules**

Handled at two levels: inside the system prompt (AI self-handles), and inside the Convex Action (code-level catches).

## **6.1 Handled by System Prompt (AI Self-Handles)**

### **Vague creative brief**

If the item description is too vague, the AI defaults to a small amigurumi ball and documents the assumption in NOTES. User always receives a usable pattern rather than an error.

### **Skill level vs item complexity mismatch**

If Beginner is selected but an intricate item is requested, the AI adjusts the pattern to Beginner constraints and notes the change. Difficulty constraint is never violated.

### **Ambiguous size**

If size is blank, the AI applies a sensible default (Amigurumi: 6 inches tall, Beanie: 21-inch adult) and documents it in NOTES.

### **Stitch count errors**

The system prompt requires the AI to verify all stitch counts before outputting and fix any errors silently. The \-- X sts declaration on every row is mandatory.

### **Undefined abbreviations**

Every abbreviation used in instructions must appear in the ABBREVIATIONS section. The AI cross-checks this before outputting.

## **6.2 Handled by Convex Action (Code-Level)**

### **Missing required sections**

After AI responds, the Action checks for all required headings. Missing sections trigger one automatic retry before surfacing an error.

### **Missing stitch count declarations**

A regex scans every Rnd/Row line for \-- X sts. If more than 20% of round lines are missing stitch counts the response is retried once.

### **Missing IMAGE PROMPT lines**

The Action checks every section block for an IMAGE PROMPT line. Missing image prompts are logged and that section renders without an image rather than blocking the whole pattern.

### **Response too short**

Under 400 words is treated as truncated. Action retries once.

### **OpenAI timeout or rate limit**

Action catches errors and retries once after 2 seconds. On second failure a user-facing message is shown. Usage counter not incremented on failed generations.

### **Quota exceeded**

Action checks monthly count before calling the API. Free users at 3 patterns see an upgrade prompt immediately with no API call made.

| ⚠️  Auto-retry limit Never retry more than once automatically. Two failed attempts surface an error to the user. Infinite retry loops will drain your OpenAI budget quickly. |
| :---- |

# **7\. Image Generation Strategy**

The app generates realistic photo-style images of the crochet piece at each major construction section, matching the style of professionally photographed pattern cards where hands hold the piece at each stage of completion. This is the key visual differentiator.

## **7.1 What Gets an Image**

| Image | Trigger | Example |
| :---- | :---- | :---- |
| Per-section image | One per \--- SECTION \--- block | Hands holding the head piece 80% complete |
| Assembly image | ASSEMBLY section always | All finished pieces laid out ready to join |
| Finished image | FINISHED section always | Completed item held in hands, final look |

A typical amigurumi pattern produces 7-9 images total. All are generated in parallel via Promise.all(), not sequentially.

## **7.2 Parallel Generation Flow**

1. Action calls GPT-4o-mini to generate the text pattern

2. When text arrives, Action parses all IMAGE PROMPT lines from each section block

3. Action fires all DALL-E 3 calls simultaneously via Promise.all()

4. Each image is downloaded immediately (DALL-E URLs expire in 60 minutes)

5. Each image stored in Convex Storage, permanent URL saved to pattern record

6. Action returns complete pattern with text and all image URLs to the app

| ⏱️  Expected wait time Text: 3-6 seconds. DALL-E images: 8-15 seconds each but running in parallel. Total user wait: approximately 15-20 seconds. Show a progress indicator updating per stage so users see active work happening. |
| :---- |

## **7.3 Critical: DALL-E URL Expiry**

| ⚠️  Download DALL-E images immediately inside the Action DALL-E returns a temporary URL that expires after 60 minutes. The Action must download the image bytes and store them in Convex Storage before returning to the app. Never save the temporary DALL-E URL to the database. Patterns opened hours later will have broken images if this step is skipped. |
| :---- |

## **7.4 Free vs Premium**

| Tier | Text Pattern | Section Images | Monthly Limit |
| :---- | :---- | :---- | :---- |
| Free | Full pattern text | Not included | 3 patterns |
| Premium | Full pattern text | All sections included | Unlimited |

## **7.5 Image Prompt Engineering Rules**

* Always start with 'Realistic close-up photograph' to anchor DALL-E in photo-realism mode

* Always include 'hands holding' the piece to match the reference pattern card style

* Always specify yarn colors explicitly. DALL-E does not read the text pattern.

* Always end with: 'showing individual yarn stitches clearly, neutral background, soft natural lighting, shallow depth of field, no text or watermarks'

* One image, one moment. Never describe multiple construction stages in a single image prompt.

# **8\. Convex Action Workflow & Implementation**

The complete server-side logic your developer implements. This is the core orchestration layer of the entire app.

## **8.1 Complete Action Code**

// convex/actions/generatePattern.ts  
   
export const generatePattern \= action({  
  args: {  
    crochetType:     v.string(),  
    creativeBrief:   v.string(),  
    difficultyLevel: v.string(),  
    colors:          v.array(v.string()),  
    size:            v.string(),  
    yarnWeight:      v.string(),  
    specialFeatures: v.array(v.string()),  
    isPremium:       v.boolean(),  // Phase 2: passed from app after RevenueCat check  
  },  
   
  handler: async (ctx, args) \=\> {  
   
    // 1\. AUTH  
    const userId \= await getAuthUserId(ctx);  
    if (\!userId) throw new Error('Unauthenticated');  
   
    // 2\. QUOTA CHECK  (uncomment in Phase 2 Step 8\)  
    // const usage \= await ctx.runQuery(api.queries.getUserUsage, { userId });  
    // if (\!args.isPremium && usage.monthlyCount \>= 3\) throw new Error('QUOTA\_EXCEEDED');  
   
    // 3\. ASSEMBLE PROMPT  
    const fullPrompt \= buildSystemPrompt()  
                     \+ buildOutputTemplate()  
                     \+ buildUserContext(args);  
   
    // 4\. GENERATE TEXT  (with one retry on failure)  
    let patternText \= await callGPT(fullPrompt);  
   
    // 5\. VALIDATE  
    let v1 \= validatePatternText(patternText);  
    if (\!v1.passed) {  
      patternText \= await callGPT(fullPrompt);  
      if (\!validatePatternText(patternText).passed) throw new Error('GENERATION\_FAILED');  
    }  
   
    // 6\. PARSE IMAGE PROMPTS  
    const imagePrompts \= parseImagePrompts(patternText);  
    // \-\> \[{ section: 'HEAD', prompt: 'Realistic close-up...' }, ...\]  
   
    // 7\. GENERATE ALL IMAGES IN PARALLEL  
    //    Phase 1: always on  |  Phase 2: wrap with if (args.isPremium) { ... }  
    const sectionImages: Record\<string, string\> \= {};  
    if (imagePrompts.length \> 0\) {  
      const results \= await Promise.all(  
        imagePrompts.map(async ({ section, prompt }) \=\> {  
          try {  
            const img \= await openai.images.generate({  
              model: 'dall-e-3', prompt,  
              size: '1024x1024', quality: 'standard', n: 1,  
            });  
            // CRITICAL: download immediately. DALL-E URLs expire in 60 min.  
            const bytes \= await fetch(img.data\[0\].url\!).then(r \=\> r.arrayBuffer());  
            const storageId    \= await ctx.storage.store(new Blob(\[bytes\]));  
            const permanentUrl \= await ctx.storage.getUrl(storageId);  
            return { section, url: permanentUrl };  
          } catch(err) {  
            // Image failure is non-fatal. Pattern still delivered without that image.  
            console.error(\`Image failed for ${section}:\`, err);  
            return { section, url: null };  
          }  
        })  
      );  
      results.forEach(r \=\> { if (r.url) sectionImages\[r.section\] \= r.url; });  
    }  
   
    // 8\. SAVE TO CONVEX  
    const patternId \= await ctx.runMutation(api.mutations.savePattern, {  
      userId, patternText, sectionImages,  
      metadata: { ...args, promptVersion: 'v1.0',  
                  modelUsed: 'gpt-4o-mini', temperature: 0.3,  
                  createdAt: Date.now() }  
    });  
   
    // 9\. INCREMENT USAGE  (uncomment in Phase 2 Step 8\)  
    // await ctx.runMutation(api.mutations.incrementUsage, { userId });  
   
    // 10\. RETURN  
    return { patternId, patternText, sectionImages };  
  }  
});  
   
// GPT call with one automatic retry  
async function callGPT(prompt: string): Promise\<string\> {  
  const call \= async () \=\> {  
    const res \= await openai.chat.completions.create({  
      model: 'gpt-4o-mini', temperature: 0.3, max\_tokens: 3500,  
      messages: \[{ role: 'user', content: prompt }\],  
    });  
    return res.choices\[0\].message.content ?? '';  
  };  
  try { return await call(); }  
  catch { await new Promise(r \=\> setTimeout(r, 2000)); return await call(); }  
}

## **8.2 Validation Function**

function validatePatternText(text: string): { passed: boolean; reasons: string\[\] } {  
  const reasons: string\[\] \= \[\];  
  const required \= \['PATTERN NAME:','MATERIALS:','GAUGE:','FINISHED SIZE:',  
                    'ABBREVIATIONS:','NOTES:','SECTIONS:','---END PATTERN---'\];  
  for (const s of required) if (\!text.includes(s)) reasons.push('Missing: ' \+ s);  
   
  const roundLines   \= (text.match(/^(Rnd|Row) \\d+:/gm) ?? \[\]).length;  
  const countedLines \= (text.match(/-- \\d+ sts/g) ?? \[\]).length;  
  if (roundLines \> 0 && countedLines / roundLines \< 0.8)  
    reasons.push('Over 20% of rounds missing stitch count declarations');  
   
  if (text.split(' ').length \< 400\)  
    reasons.push('Response too short, likely truncated');  
   
  return { passed: reasons.length \=== 0, reasons };  
}

## **8.3 Image Prompt Parser**

function parseImagePrompts(text: string): { section: string; prompt: string }\[\] {  
  const results: { section: string; prompt: string }\[\] \= \[\];  
  const re \= /---\\s\*(\[A-Z\\s&\]+)\\s\*---\[\\s\\S\]\*?IMAGE PROMPT:\\s\*(.+?)(?=\\n|$)/g;  
  let match;  
  while ((match \= re.exec(text)) \!== null) {  
    results.push({ section: match\[1\].trim(), prompt: match\[2\].trim() });  
  }  
  return results;  
}

## **8.4 Database Schema**

// convex/schema.ts  
export default defineSchema({  
   
  users: defineTable({  
    clerkId:        v.string(),  
    email:          v.string(),  
    isPremium:      v.boolean(),  
    monthlyCount:   v.number(),  
    monthlyResetAt: v.number(),  
    createdAt:      v.number(),  
  }).index('by\_clerk\_id', \['clerkId'\]),  
   
  patterns: defineTable({  
    userId:        v.id('users'),  
    patternText:   v.string(),  
    sectionImages: v.record(v.string(), v.string()),  
    metadata: v.object({  
      crochetType:     v.string(),  
      difficultyLevel: v.string(),  
      colors:          v.array(v.string()),  
      size:            v.string(),  
      promptVersion:   v.string(),  
      modelUsed:       v.string(),  
      temperature:     v.number(),  
      createdAt:       v.number(),  
    }),  
    rating:    v.optional(v.number()),  
    isSaved:   v.boolean(),  
    createdAt: v.number(),  
  }).index('by\_user', \['userId'\]),  
   
});

# **9\. MVP Build Sequence \- Images From Day One**

Image generation is included from the very first testable build. Every test run from Step 3 onwards produces the complete experience: full text pattern plus realistic section images. The isPremium gate is added in Phase 2 once payments are wired. No rework needed at any phase.

| 🎯  Core principle Text and image generation are always one atomic operation inside the Convex Action. Testing from Phase 1 reflects the real premium product experience so quality is validated before monetisation is added. |
| :---- |

## **9.1 Phase 1 \- Full Core Loop with Images (Steps 1-7)**

Delivers the complete visual pattern generation experience. Everything built here carries forward unchanged into Phase 2 and 3\.

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| 1 | Scaffold React Native \+ Convex \+ Clerk | Working login and signup. User record created in Convex on first sign-in. Clerk session available to all Convex calls. |
| 2 | Build prompt assembly functions | buildSystemPrompt(), buildOutputTemplate(), buildUserContext() written and tested with Node.js console output before wiring to the API. Verify the assembled prompt reads correctly. |
| 3 | Implement full generatePattern Action \- text \+ images together | Single Action: assemble prompt \-\> GPT-4o-mini \-\> validate \-\> parse IMAGE PROMPT lines \-\> DALL-E 3 via Promise.all() \-\> download images immediately \-\> store in Convex Storage \-\> save record \-\> return text \+ image URLs. Always generates images. No premium gate yet. |
| 4 | Build pattern request form | All preset fields wired to the Action: crochet type visual cards, difficulty selector, colour chips, size picker, creative brief field, Advanced Options toggle. |
| 5 | Build pattern display screen | Scrollable view: section title \-\> section image \-\> instruction rows with stitch counts. Loading skeleton shown during generation. Matches magazine card layout from reference image. |
| 6 | Add loading and progress state | 'Writing your pattern...' \-\> 'Generating step images...' updating as each Promise.all() result resolves. Users see active progress across the 15-20 second wait. |
| 7 | Validation, retry, error handling | validatePatternText() on every response. Auto-retry once on failure. Quota not incremented on failed generations. DALL-E URL download runs immediately on every image. |

| ✅  End of Phase 1 \- Full MVP ready A user can sign in, fill the form, tap Generate, and receive a complete pattern with realistic crochet images at every construction section. Share with 5-10 beta testers and validate quality before Phase 2\. |
| :---- |

## **9.2 Phase 2 \- Monetisation (Steps 8-10)**

Add the revenue layer once pattern and image quality are validated. The isPremium gate wraps the existing image block. No rebuild needed.

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| 8 | Usage quota tracking | Monthly counter on user record in Convex. Resets 1st of each month. Free users blocked at 3/month and shown upgrade prompt. Uncomment the quota check in the Action. |
| 9 | RevenueCat integration | In-app purchase for iOS App Store and Google Play. isPremium flag written to Convex on successful purchase. Premium users bypass quota check. |
| 10 | Free vs premium image gating | Wrap image generation block in the Action with if (args.isPremium). Free: text only, 3/month, \~$0.03 each. Premium: full images \+ unlimited, \~$0.31 each. |

## **9.3 Phase 3 \- Retention and Polish (Steps 11-13)**

| Step | Task | Deliverable |
| :---- | :---- | :---- |
| 11 | Saved patterns library | Save any generated pattern. Library shows name, type icon, date, finished thumbnail. Tap to reopen full pattern with all images. |
| 12 | Ratings \+ prompt logging | Thumbs up/down stored per pattern with promptVersion and modelUsed. Foundation for quality tracking and A/B prompt testing. |
| 13 | App Store submission | Final testing across all crochet types and difficulty levels. App Store screenshots. Submit to App Store and Google Play. |

| ⚠️  OpenAI budget during Phase 1 testing With images always on, each test generation costs \~$0.31. Set a hard spend cap in the OpenAI dashboard before starting. A $30 cap covers \~95 full test generations. More than enough to validate quality with a small beta group before adding the premium gate in Phase 2\. |
| :---- |

Crochet Blueprint App \- Internal Product Document

Confidential  |  Version 6.0  |  February 2026

# **10\. UX Design & Screen Specifications**

This section documents all ten app screens, the complete design system, and interaction specifications. The interactive HTML prototype (CrochetApp\_Prototype\_Full.html) is the canonical visual reference. These specifications are the written companion for developer handoff.

| PROTOTYPE  Interactive reference Open CrochetApp\_Prototype\_Full.html in any browser to click through all ten screens in the correct phone shell with live interactions wired up. |
| :---- |

## **10.1 Design System**

### **Brand Personality**

Playful and craft-forward. The visual language draws from physical yarn craft: saturated colours inspired by yarn skeins, hard ink drop shadows that feel like stamps or cut paper, chunky 2.5px borders like embroidery outlines, and colourful stripe rules that mimic stitch patterns. Every interactive element has a physical, tactile quality.

### **Typography**

| Role | Font | Weight | Usage |
| :---- | :---- | :---- | :---- |
| Display | Fraunces (serif) | 700-900 | Screen titles, pattern names, section headings, hero headlines |
| Body | Nunito (rounded sans) | 600-800 | All body text, buttons, labels, metadata, tag pills |
| Code | Courier New | 400 | Stitch instructions, round numbers, abbreviation codes |

### **Colour Palette**

| Name | Hex | Role |
| :---- | :---- | :---- |
| Ink | \#1A1A2E | Primary dark: hero backgrounds, all borders, drop shadows, tab bar |
| Sun | \#FFD93D | Primary accent: active states, Quick Create CTA, stitch count pills, paywall CTA |
| Coral | \#FF6B6B | Secondary accent: amigurumi type, round labels, Generate button, error states |
| Mint | \#6BCB77 | Success / done states, assembly section accent, PDF download button |
| Sky | \#4D96FF | Links, hat type accent, body section accent, info callout borders |
| Lavender | \#C77DFF | Premium surfaces, shawl type, paywall gradient, profile header |
| Peach | \#FFB347 | Warning states, bag type accent, gradient partner to coral |
| White | \#FFFEF9 | Card backgrounds, form fields, tab bar background |
| Off-white | \#F7F3FF | Stitch row fills, form input backgrounds, advanced options area |

### **Drop Shadow System**

All interactive cards use a hard offset drop shadow in ink rather than blurred shadows. This creates a bold stamp-like feel. Shadows shift on hover and press to simulate physical depth.

| State | CSS shadow | Transform |
| :---- | :---- | :---- |
| Default | 3px 3px 0 \#1A1A2E | none |
| Hover | 5px 5px 0 \#1A1A2E | translate(-2px, \-2px) |
| Active / Pressed | 1px 1px 0 \#1A1A2E | translate(2px, 2px) |
| Prominent CTA | 4px 4px 0 accent-colour | none |

### **Colourful Stripe Rule**

A repeating stripe pattern in coral, sun, mint, sky, lavender appears at the hero bottom edge, between pattern sections, and in the PDF page header. It is the primary brand motif and references the look of yarn sample cards.

## **10.2 Screen-by-Screen Specifications**

### **Screen 1 \- Onboarding (3 slides)**

| Slide | Art colour | Headline | CTA colour | CTA label |
| :---- | :---- | :---- | :---- | :---- |
| 1 \- Welcome | Coral to peach | Your AI crochet pattern maker | Coral | Let's go\! |
| 2 \- How it works | Sun to peach | Describe it. We'll make it. | Sun yellow | Show me more |
| 3 \- Premium | Mint to sky | Real photos at every step | Mint green | Start creating free |

* Progress: 3 dots at bottom. Active dot is wider (44px vs 28px) and full white. Done dots are 40% opacity.

* Art zone: Large gradient circle with emoji, 3 concentric dashed rings rotating at different speeds and directions.

* Floating accent dots animate independently with 4-second translateY loops.

* Primary CTA advances to next slide. Slide 3 CTA navigates to Home.

* Secondary ghost link on every slide skips to Home or Paywall.

### **Screen 2 \- Home**

| Zone | Component | Key detail |
| :---- | :---- | :---- |
| Hero | Animated blob background | 5 coloured blobs (coral, sun, mint, sky, lavender) on independent 4-6s float loops |
| Hero | Spinning logo ball | Conic gradient, 12s rotation loop |
| Hero | Headline | 'anything' has a 6px sun yellow underline highlight via ::after pseudo-element |
| Hero | CTA card | White card, yellow drop shadow, coral icon box, black arrow pill |
| Hero | Stripe rule | Coral/sun/mint/sky/lavender at hero bottom edge |
| Body | Stats bar | 3 equal cards: patterns made (sun), this week (light coral), streak (mint) |
| Body | Type browser | Horizontal scroll, 8 coloured cards. Active: ink border \+ shadow. Updates FAB. |
| Body | Quick Create FAB | Full-width coral. Subtitle updates in real time when type card changes. |
| Body | Recent patterns | 3 cards with coloured emoji thumbs, Fraunces name, tag pills, ink arrow |
| Body | Premium banner | Sky-to-lavender gradient, decorative star pattern, arrow button |

### **Screen 3 \- Generate Form**

| Field | Component | Interaction detail |
| :---- | :---- | :---- |
| Progress pips | 4-pip bar at top | Pip 1: mint (done). Pip 2: sun (active). Pips 3-4: off-white (pending). |
| Crochet type | 2x4 grid of coloured cards | Single-select. Selected: 2.5px ink border \+ 3px shadow. Deselects previous. |
| Difficulty | 4-segment bar | Single-select. Segments in off-white container. Selected: sun yellow fill. |
| Colours | Circular swatches | Multi-select. Selected: scale 1.2x \+ ink tick mark overlay. |
| Size | 4-button row | Single-select. Selected: sun yellow fill. Custom option can open text input. |
| Creative brief | Bordered textarea | Border changes to coral on focus. Character counter updates live. |
| Advanced toggle | Collapsible section | Chevron rotates 180deg on open. Reveals yarn weight \+ special features. |
| Generate CTA | Sticky bottom button | Coral fill, sun shadow, full width. Navigates to Loading screen. |

### **Screen 4 \- Loading**

* Full dark ink background. Conic gradient orb (all 5 brand colours) with pulse animation and colour glow.

* Pattern brief shown below orb (type, item, difficulty) as subtitle text.

* 4-step progress list. Done: mint tint \+ green tick. Active: coral tint \+ bouncing emoji \+ spinning ring. Pending: 20% opacity.

* Step labels in order: Assembling brief, Writing stitch instructions, Generating step images (with n-of-total count), Saving to library.

* Ghost skip button navigates directly to Pattern. Auto-advances after 3.5 seconds.

### **Screen 5 \- Pattern View**

| Zone | Component | Detail |
| :---- | :---- | :---- |
| Sticky header | Name \+ 4 badge pills | Fraunces bold, badges colour-coded by type/difficulty/size/yarn |
| Sticky header | Heart \+ share icons | Off-white, ink border, 2px shadow. Heart toggles filled state. |
| Materials strip | Horizontal dark scroll | Ink background, 5 labelled columns. Scrollable if more items. |
| Each section | Image (200px) | Gradient placeholder matching section colour. Badge shows 'SECTION \- Step N of M'. |
| Each section | Title \+ note | Fraunces with 10px coral left-border pip. Italic note in gray below. |
| Each section | Stitch rows | Off-white cards. Coral round label. Instruction. Sun yellow stitch count pill. |
| Note rows | Highlighted rows | Peach tint background. Italic gray instruction text. |
| Section gaps | Stripe divider | Same 5-colour stripe rule pattern at reduced opacity. |
| Bottom | Finished card | Coral gradient, large item emoji, Save \+ Download PDF buttons. |

### **Screen 6 \- Abbreviations Tab**

Reached via the 3-tab row at the top of the Pattern screen (Pattern / Abbreviations / Export).

* Active tab: coral text \+ 3px coral bottom border.

* Intro callout card: sun yellow background, lightbulb icon, US terminology note.

* Abbreviation rows: code in coral bold, equals in gray, full definition in ink2.

* Notes card: white with ink border and shadow. 5 production notes covering construction method, gauge, stuffing, difficulty justification, and pattern-specific tip.

### **Screen 7 \- PDF Preview**

* Warm beige background. White page cards with realistic multi-layer box shadow.

* Page header: brand logo \+ pattern name \+ badge pills \+ colourful stripe rule.

* Materials: 2-column grid of off-white cells. Print-optimised font sizes.

* Second page shown at 70% opacity, rows fade to 'continued on download'.

* Sticky footer: mint Download button, then Share / Email / Print row.

### **Screen 8 \- Upgrade / Paywall**

* Full dark ink background. Diagonal crosshatch pattern in hero zone.

* Crown emoji: 56px, bounces with slight rotation on 2s loop.

* Feature rows: 4 rows with coloured icon pills \+ mint tick. Coral, sun, mint, sky colours.

* Plan cards: Monthly and yearly. Yearly pre-selected with coral 'Best value' badge. Radio fills with sun yellow on selection.

* Yearly price: $2.99/month shown. CTA: '3 days free' trial.

* Fine print: Restore purchases, Terms, Privacy. All tappable.

### **Screen 9 \- Library**

* Mint-to-sky gradient header. Title in Fraunces, pattern count subtitle.

* Horizontal filter chips: All, Amigurumi, Hats, Bags, Scarves, Beginner. Active: sun yellow.

* 2-column grid. Each card: 100px coloured emoji image, name, type \+ difficulty. Ink border \+ 3px shadow.

### **Screen 10 \- Profile**

* Lavender-to-bright-purple gradient header. Conic gradient avatar, name, level label, Premium badge pill.

* Stats row: 3 equal-width cards (patterns, streak, this week). Hard ink shadows.

* Upgrade card: coral, plan status, Active badge in ink/sun.

* Menu: 3 groups (Account, Patterns, Support). Each item: emoji icon, label, gray arrow. Ink border \+ shadow. Hover shifts.

## **10.3 Navigation Architecture**

| Tab | Icon | Primary screen | Also reaches |
| :---- | :---- | :---- | :---- |
| Home | House | Home | Quick Create shortcut to Form |
| Create | Sparkle | Generate Form | Loading, Pattern, Abbreviations, PDF Preview |
| Library | Books | Library | Pattern (tap any card) |
| Profile | Person | Profile | Paywall / Upgrade |

| Screen | How reached |
| :---- | :---- |
| Onboarding | First launch only. Not accessible from tab bar after completion. |
| Abbreviations | Abbreviations tab on Pattern screen. |
| PDF Preview | Export tab on Pattern screen, or share icon in header. |
| Paywall | Premium banner on Home, profile upgrade card, or quota limit hit. |

## **10.4 Key Interaction Details**

### **Type card and FAB sync**

Tapping a type card on the Home screen updates the Quick Create FAB subtitle in real time. On the Form screen, selecting a type applies the ink border and shadow and removes it from the previously selected card. Single-select only on both screens.

### **Colour swatch multi-select**

Swatches support multi-select. Selected swatches scale to 1.2x and show a tick mark in ink. Validation should require at least one colour before allowing Generate to proceed.

### **Loading auto-advance**

The loading screen auto-advances to the Pattern screen after 3.5 seconds. In production this delay should wait for the actual Convex Action to return. The skip button shows the most recently generated pattern or a partial state.

### **Section image placeholders**

During Phase 1 testing, image slots show coloured gradient placeholders. Placeholder background colour matches the section accent colour so the layout reads as intentional. In production these are swapped for real DALL-E images stored in Convex Storage.

### **PDF page simulation**

The PDF preview uses white cards on a warm beige background with a multi-layer box shadow to simulate paper. The second page fades to suggest further content behind the download gate.

## **10.5 Responsive Notes**

* Designed for 393px width (iPhone 15 Pro). React Native will reflow to other sizes.

* Type grid on Form screen: fixed 4 columns. On Home: horizontal scroll row.

* Materials strip on Pattern: horizontal scroll only. Never wraps to two rows.

* Filter chip row on Library: horizontal scroll only. Never wraps.

* Stats bar: always 3 equal columns. Never stacks vertically.

* Paywall plan cards: full-width stacked. Never side-by-side.

Crochet Blueprint App \- Internal Product Document

Confidential  |  Version 6.0  |  February 2026

# **11\. Appendix — Screen Mockups**

All ten screens of the Crochet Blueprint app rendered at full resolution. Each mockup shows the complete phone shell with accurate colours, layout zones, typography hierarchy, and component states as specified in Section 10\. The interactive HTML prototype (CrochetApp\_Prototype\_Full.html) accompanies this document for live clickthrough.

**Screen 1 — Onboarding                                                       Screen 2 — Home**

![Onboarding screen][image1]          ![Home screen][image2]

**Screen 3 — Generate Form                                                  Screen 4 — Loading**

![Generate form screen][image3]          ![Loading screen][image4]

**Screen 5 — Pattern View                                                     Screen 6 — Abbreviations**

![Pattern view screen][image5]          ![Abbreviations screen][image6]

**Screen 7 — PDF Preview                                                     Screen 8 — Upgrade**

![PDF preview screen][image7]          ![Upgrade screen][image8]

**Screen 9 — Library                                                              Screen 10 — Profile**

![Library screen][image9]          ![Profile screen][image10]

Crochet Blueprint App \- Internal Product Document

Confidential  |  Version 6.0  |  February 2026

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANgAAAGRCAIAAACIYuqqAAAaFklEQVR4Xu2dibcUxb3H80ckJqdZlVVR2ZFFQC8ICrIIKIKIgILykAsiRhFBZFNBkU1AfCyuoIiAImLAHCOyuURM8LnmqS/kGU3wKQkiosyroe4t+vZvprp6/3X395zPmVNTVV3L7/eZ6pkLd+4vDh8qAJA4v6BVAMQPRAQsgIiABSGIaFnng5xDrfBKIBHpgkDOoZIY4kdEOj0AdqgzrngTkU4JQDmoPxo8iEhnAsAVKlJJTEWkEwBgCNWJYiQiHRoAT1CpHLiLSAcFwAdULTsuItLhAPANFUyhE5EOBEAQqGOKsiLSUQAIDjVNJyK9HoCwoL5BRJAMVLkSItLLAAgXah1EBAlArYOIIBlcRKQXABAFEBFwoayItCsA0QERAQsgImABRAQsgIiABRARsAAiAhZARMACiAhYABEBCyAiYAFEBCyAiIAFEBGwACICFkBEwAKICFgAEQELICJgAUQELICIgAUQEbAAIgIWQETAAogIWAARAQsgImABRAQsgIj+GffW7Q40TfZWQIGILkSnUUTDphSIWJbYLIGRFkRU8LGByTJiBiIyUtAOwyVFCkTkTk6MzKOIOUltusiXiGlXkOe7iFDIi4hZSmFmNmInLyJGQZ9lBQflmui1wcmYjhDRiLCUCmuc7JFZETN2YGSebIoY0MJETqyAkwbccuJkTUTf+eBzxwyyDN/bT5xMiZjeNFB865jSIGRKRK/4Tnac+DuqU6djTkX0kdoE8ediuki9iD5e+ilNakqXbUi6RfRhYd5IS4hSLKKnf7WL7jgpjBunoDWqMkHMo5QgaRXRPLhhvcEKRazgIyg87cs8XEmRShHNw+opWyUJyxsHoQzraWvmQUuEVIpoiKc8UUJxxYSAE5m/2Di7mGURfRPQDH8EmdRQRM5kUETfWQmiQogwWUbMpEZE89uKDxFD/AwRCr7XY7h382DGRjpENPxJjfm7JYW/fMeGj+UZRsAknnGSGhFppQPDBOQBk1CYhDROUiBi6CHzfeNLEK8LTp2L3EUMPVheM8qHKFYeenh9w11EV0xe+ooochkzGdhCSfIlImBLukU0tDCrp4gJhiFKnBSLaBjiNH40McF8U4aBShamIrq+iTYMrnm2UorhBl3D5RrwqOEoYohBMcxTejE8711FtEINuw8yLmIeMBHRhGTDzk5E13CYvLjDyk1aKHzUWUKbPOEa/OiAiKlHWWjioj56rsGPDnYi6tHHURKnhfItmh56Vbh4FdEkhvGTJhFNIhhH4olq5tDRguNJRMssjPHDSETX+0KyEaRWBYGOH5AqEc0GTzaSJUmNiMnGjpoUHDpLbOiDqU9ERHARMfjmo0gttScK6LyJEzwdXsmIiFGkkxoTHXT2gAQcM2A6fMBFRB/Ysxgw7g6oKDpm9tdB+5eHrsQ34Y4WAyxE1L/+Sr6hiTSF7lDhTKDjEOh6oqNkYBX6pIQOCxF9EFH+qBk1oG75g45sg67KHyZDaVyEiDUoF6kokkedqAH1KQh0fBt0bRFRLrySOF3kLqKGcNNGbTgN1Sgs6FzV0BVGgV7EOElYxDhfcxqoB6eh9oQLnbEaus4Mk24RQ8kWNaAKKk100NlDcjHgIAETZE66RQwOzf1pqC7RQWevhq7ZEwFHiC1BCYuowfXtS8AQS2jii1BR4oGuJKQ90kpuJCmi/tXmKmJwaNYZihhcI9cRYgi1KxCRQP2IE7oeN42Cow+1Pk1hwVdEPcHTQ/OdvIUSuqrAmw1CkDSZk6SIQQieG5rsDIsYZIRci6i/WQQJq4RmmouFErq2YFt2vVwf8BhgKqIe17C6QtPsVCFxyArpLsxxvTy/IgY58F3DqofmOBUiBt81reRDKkUMCE2wUwImkHXSvZgT8PKo4Shi1LcJmmCnAUwg66R7iQdNssICIkLEKjRh1yQrLHInIs2uM/1eOXlcB+3vCbJauqOw0IRdk6ywSExEDZqIBIem1pl7r2hs0zQZQlZLdxQWkYbdlfSJGDAZNLXO3HtFY5umyRCyWrqjsNCHPWogYo5E1F+uD3vUcBQxOmhenYn3gcY2TZM5ZM10X4YEuTZqICJJvFc0tmmazCFrpvvKABxF1N8jgmSCJtWZdR9obNM0mUPWTPeVASAiSbxXNLZpmswha6b7MiTItVH/BAciksR7RWObpskcsma6L0OCXAsRnQSJJk2qM+s+0NimaTKHrJnuy5Ag10JEJ0GiSZPqzLoPNLZpmswha6b7MkR/rT7sEDFkaF6difeKxjZNkyFktXRH5ugvjzTsrnAUMVJoap2594rGNk2TIWS1dEdhARG9ETAZNLXO3HtFY5umyRCyWrqjbAARISILOIoY9T2CZteZfk9obNM0mUDWSfeSGRITUf8pLFIXaYKdBnhCY5umyQSyTroXc1wvjzTmrqRSRNeY6qEJdhrgiZPkP8Paof3NIeukezFHf7k+4PpkhQJEDOwilS8UEekKA++aVir0AdcnKxRSKWJwaI6dHiQOWSHdRYjoA65PVihARJYu0rUlKmIMJCai5eainuCJoZnm4iJdlZfN7p1WkNgrPY3gIEiazIGImRJRWUhd9E2QNJmTpIh6YrhZ0Hwn7yJdj7GFFkSMgsRETNBFupIwRHQdIYZQu8JXRCuWANGsV0EtiRq6Bo8WSuhxqB8khiCbkLCI+mM/hhjRxJ+GuhIddPZq6JrDJYYgm5BuEcPKE01/FdSYKKDzxqKgRB9kfYJCJGERrRi3qoFKcBrqTbjQGauh64yf2LKTehFdEybGN5mCenAaak9Y0LmqoSv0ges4TI5DK9siSgUVtIMDakMNqEZBoOPboGvzR8ChTIIWFsmLaAXecLlwexXRis1FOrINuip/BBzKMGJhwUJEPfrbhwYfIlquLkqoWybQcQh0PUlhHrFQSIGIQfBqoYT6oYMK51E+BV1JfkiHiCaHYuiJpKJEB509CCYDmoQ0TriI6PXQophE3yvUmCig8wbEZEyIWBa9iyaBM0mAP6g9waGzhILJyPpg6hMREakR0QSTHPiGmhQEOn4ohDJ48ET4gJGIaYFaZQ4dLVximCIieIno+lrU31Pih6pGoVdxxjUFEcFLRMsgECYupi798SBCp4+ea/Cjg52IruhDqciVi4abdQ0dRPSGa0CtkN62pwLDbZoELUEyK6KVDxcNN+h6U04cpiImeI/IJMwttNiKGC6Gx0Zu4fCy5yuiSXTMX+gZczHc7ZiEOmr4imiZBSiHLppvxCQ4JkGOgRyJaHlJIVvMt2D4AcUkyDHAWkRDTMINSsLEQisbIloeXczDj3VMAjLO+38Zjo6MiOiDtOjoY50mFnIjvyJKvOY4ZpgvL0RSI6LhTSSNh0H8GAYzTlIjomUcPt8uMjl+fC/DcOOGYYyZNIloeQmiYVZK4luFIASZ1HCzrD6dOEiZiJaxi4Y/RWNCDBZaxqFLhPSJGD9BLCmHj8/CQeB8FkpyIaL5maEhTm9ySC5EtKK/U8sTTqEqac/gRL2XREi3iF5vNxnIXwa2UJJ0i2h5f/eT3kR6PQi9RiZZUi+i5f1czAnpCksWRJT4iLvXMyZ+/C0vXWehJDsi+oanjr6XlDoFJRkUMaWZyDkZFNEK7KLv0wj4JpsiWoFdtOK6ZYcyS/DNJk5mRZRwy1Bw5xxw26BvMi6iFc1HSHmM2a1SNeXq6SABiWJfCZJ9EUEqyJeIaT9FUr14PfkSUZG6jKZuwV7JqYhWek7HVCwyOPkVkT85UVACEU+Tq8RzAyKWJuYbd5xz8QQiGgFRogYiekYelnY1VY0d2kqHAgqICFgAEQELICJgAUQELICIgAUQsQSFk8fDwtOwdCX5ASKWgCoSBPNh6UryA0QsAVXEN55GpivJDxARsAAiAhZARMACiAhYABFLI7/msP8vfxkDMX97LE8gYgliU9BOzl2EiCVwFbGwbJl63HvzzT8vXSrK20eOFIXhdeuKyit+9asfFy/+bPr0K3/zmy9nz959akDRKuoH/frXRxcskJfLEarGhIgQ0YFDuxW9egmB7DVSoL9MmyYeJzdvLgyT9UpEZZgoDDzjjK3Dh28ZNky0fjJ16qGZM6WIsqcdupL8ABFL4PBjSY8ejpqF3boJn4bXqyce+5/yT9a7ivhI794LKiogIgUilsD11ty/5t1Z3prfnjhRFQacccaJJUu+mDFD3Jr/PmeOujXLa3FrpkDE0pi4GCI5t9CCiBrU36qIATp73oCIgAUQEbAAIgIWQETAAogIWAARAQsgImABRAQsyKyI6jeSFjz4sHpKu/nAPk6zZp1D/9Wn/fv2hztgKsisiIJPP/lYpfP4D/9q2bIb7eOVRQuXizH/duh/VE0U0hiOadInLWRZxPr124hUXXbpYFE+9v0R8dii+cUHDhw4/M+vZs2aL56ec86FGzdu+enEsQYN2k2fNve9AwdEZaNG7TdvevH7o9/t3bvv66++dIxJz7+S0ixatEKo//K2V0S5snLK+wcPdu3aTwwoj2fR+u3//UM8bdy4ver/3bf/lP3VmK9s3/Hj8X/XrdtSVs6ds+DEj9//8Z137H0EH374gWP2NJJlEQWPPvqYSNVLL22XT5WXojB//mJZkBqtX/ec8klVOgwbPnycOAtvuWWqqN+69WVHZ4X98vPO6yoLS5eulIUtm7fK1okT75SFDRs2qf7iVWEf4cEHlqqmo//+VhT27NkrdBSFN/e/6Zg31WRcRMuW1G7dBqrMicLPP9VI+ZrVT9pbS+ZYHJPduw90dKCdxdMvPv/MUSPOM0frmWcWD2z5SPvLMadOnS0LhVPvB8QixfknayBiyhDZEndJUejR40q7PSd//kEWZKWJiPISwa7X39B0Fk8P/fULRw0VUb5zkCLS/nJMu4hv7HrD3gcipoxCtYiy3LPnVbIg7nqyINP52NqnVF5VpYPJt06XhaZNO4kOFRdfUbJzyRol4rZtr8jWyvF3yMKO3+2k/WWNXUT1MpDs2b2n5CJTSsZFPPjnP8uk1qrVXDxt1arbn95775vDX8+Z/aDsIN7DffXV/657ekOfPtfInuLDgSyce24XNU6TJh1k5VVXXW9ViyKYMKH4Pk9in3fF8lXic8am51+wd1YDiveLR747vH/ffjGs6n/ku28c/evUaWEffOXKtSd+PGo/F8VetlV/vkk7GRcRpAWICFgAEQELICJgAUQELICIvLh24JW0Mg9AREac/OTFwqdbaX0egIhFWpzbSRigJLCX4+SJBdMTmZcD2RdRWnXs/U07n3hQFOrXa9W+dVdRWL/4HvE48foRos+a+XfJbqIwvfImVRZNX+1fJ8pfv7VeKvLqk8VB9j2/dMPSWaIghxJsWTlXPO56ZpGaVzTJE+7owedln0mjR8rL69ZpITp8ufdpUf5wxyo5smUTcfW8qaLw1uZlmgWommyQfRHtx4wUYt6UibLmrvE3Opoc5dq1m9srr7z81L/pfbp17m3jRaFfzz72ztddeZXDjPvvmCBrbrvxelFYee8U2X/b6vtl4aePT/1Tyqdbl95zm2Vb6okPtwhrLe0CGpzVWi4gG+RRRFm+adiwpxfNKNmkyoN695dlSZ3axZNMeqDGV52HDyor4uQxRREfve9O2X/72nmyQ5sWncdeO0zUrJhzh1W9VGGneOzVrZfhArJBHkV8ZslM8XjpxZfdPna0o8lR7nnRpapS4fBAdfYqoiiIk69Jo7aFmiJWjrrO0wKyQY5EbNa0vShUXNhDpfnzPzyu0iwrRw8ZSsvrFt0jCoP7DlA9wxJx+ezbO7W7uFBTRFEQbyLVLK4LyAZ5EXHPhsXHP9jcuX2FqGnerKNQ8PX1C8+s30ppNGrw1d8f3DRswCBHuV2rLuLzhPhkMK3yJqtaO8G5Zxf/44w0Rj5VTXJe1WTn5TXzZEEcxuITiVjS6KFDT3xUvBd37dDdPsLHr64WhacW3l1uAXSnqSYvItJ6wIrsiyh//HHr6FG0CfAh+yKCVAARAQsgImABRAQsyL6I6lfvXHn/4EFaCeIhlSI++uhj9eq1ll94ECJxiii/3iQUjv/wry5d+k6aVPwvGuklrSKKx06devfrd638aqWKigHyGzkEHTv2loX77lto1TwRW7fuLvrXrt1C9Jc1TZp0ECncs3uPVS2i+sXQLZtr/PRxzeon69dvc8P1E2QH+UvNgwffIMZs2rQTHU3hGFYiRZSVqkn2lL+/vHHjFlkplyF/J1/2PPLdN2qcgQNGtGlziWMoeweFYzvcSLGI657eUKtW82bNOqv68Tff3qBBOyWieGrVFLFt2x72/tYpvcTj3788ZNmM+enEscaN26uvO1K8uf9N2cGqFvG668b17HmVEtE+2qhRlfKXqUuK+O6776pKh4jyFfX0U8/al7F504tnn32h/JoUO2IKOal4SYhH2kEgxhHd6HZYkUoRk2Ls2Mm0EoQCRDTlh2NV31sCogAiAhZkVsThQyfRymRZv3YnrYyBfb//lFZyIy8iDrt6Iu1DeWpV8TuN5GPoQEQNaRJxyQPrLmjbe8Swyase3nJus4uWLXhWVHbudMXcGSsbN+64fdPb4unOFw+Mu/Hupk0vlCIue+jZOycvEJ8ZpYjiacMG7eWHWXtnUe7Usd/gQePsIi6a91TL5pesW71DlCu6Fr/MrmvngZVjZ6r1nH9exeMrt8mF2b23dxPy9eg29Pcv/UmWz6zf9pXN79jXLxFP/3Pp5jatLq246Kopt1Z9U9njjxYHt49m7yDWJrYmCmuWv9ioYQdREAOKQURh64Z9YiKxzdXLX2jVsocQcfeOj+rVa62mY0iaRNyz82NZEGG1bC/0i7oMEo+zp6+wqg/CWyvvFYXuF18t+gj6XX69FFE9lReqzsI2Ub92xVa7iLKz4zixp3P+nDXLF24466x27dr0chzAqps8BR9e8IwqSy1kQfa5pNsQdcmKhc91bN9X1ksR7aOpDmpr3Suulq8rNYgQd8iVxf+/3bplz9deLv48SG45omM+LNIkYsOG7cVrfeZdy845u8vvtvyxaZPiSWbVFPG3t8xbt6Z4hkkzxOEh07nxyT+IgngqcyNRncVpKs420UGcN8IS+djgrAu2rN/dv0/x53MKuxOPLN4oJJA+yemkYfZuQj7ht/BGlq1TWtjXLy8RT++ftapu3Vab1u26os9oeS0V0d5BrE12mHHn0p0vFH88/sCctWIQUVAiioP2uSdfEzOOG3P369v/y6qOEkPSJKIJMgeGeOrsj6TeF6aOrIkIUgpEBCyAiIAFEBGwACICFkBEwAKICFgAEQELICJgAS8RC+PGgcSheYkBLiLScIBkoTmKFBYi0igADtBMRQdEBDposiIieRHp5gEfaL4iAiKW4eRxZ42jvlyHcnzzdeGDg87KNEBTFgUQsQx2z1avKhw7Uti4ofDFX4r1skk+vv9e4dDnhalTq3pWVhaOHC48s66q9b8/Lnx1qDBpUrGsEXH8+MJDC5yVbKApiwKIWAYl4tRTf6Ne1dgFnT3beS6e+L6w67XC2tXF+p+OFV57tfDwkqo+B98r7HylRucZd1dpreRmCU1ZFEDEMlARHfWKHdtPV0r57CIurRYRJ6IWiFgG+0Elbs3Hjxb27CqW9+2u4eLb+wvf/qMwe1bV0+Kt+ZvCxmer+hRvzX9zvzXzhqYsCiBiqEyYUPjrZ8W3khMnOpvSCc1XRCQvopUxF7MFTVZEsBDRgossoWmKDogISkNzFClcRFTQiICYoUmJAXYignwCEQELICJgAUQELICIgAUQEbAAIgIWQETAAogIWAAR3Rk+5A5HzfyZ62m3qGnd8jJamRnyK+K02x5Zcn/xO/glA/uOe3D2s+PH3Hvv3cU/bbfsga2tWlwqCg/N3Th21KwBfYv/8DXq2qq/ACpEnDlldZ06rURZDCJ6Vt54nyiPvGZqo4Yd5QgS2SoKYoSFczc6pm7S+MI5dz0uCjePuVcWbqtc2P2ia0ShcaNOI4beqS4U44slqWGzR35FlJzXrEIWOncsfiN8rVotVNPcaU+0adVLFCb9R/HPSfS//CYhn2ySJ+KIoVNUzymTHpblBXOeE483jTr9VzBEq3jscEF/VSMRUz9UraZ0WkxXu3bLG0feY9lEVBfiRMwm4vyrX69Np/ZVfy+3+fnFPzZ73ZApDRt0EGfYuc0qxAkkvDyzftuH578gmoZfXfxbpxIp4g3Dp4ueYhB5VonDTDxOvXW5GKFvrzGibG+V4zumFkfjOWd3FTVjRtwjCmK6awf/dtF9m0TNkEGTFp8qqAsvu2SkGiF75FdEr7Rs3pNWgrCAiIAFEBGwACICFkBEwAKICFgAEQELICJgAUQELICIgAUQEbAAIgIWQETAAogIWAARAQsgImABRAQsgIiABRARsAAiAhZARMACiAhYABEBCyAiYAFEBCyAiIAFEBGwACICFkBEwAKICFgAEQELICJgAUQELICIgAUQEbAAIgIWQETAAogIWAARAQsgImABRAQsgIiABRARsAAiAhZARMACiAhYABEBCyAiYAFEBCyAiIAFEBGwACICFkBEwAKICFgAEQELICJgAUQELICIgAUQEbAAIgIWQETAAogIWAARAQsgImABRAQsgIiABRARsAAiAhZARMACiAhYABEBCyAiYAFEBCyAiIAFEBGwACICFkBEwAKICFgAEQELICJgQVkR4SKIE4gIkschHkQEyeAiIlwE8QARQfJQ60qICBdB1FDlICKIG+pbWRHhIogIapqLiIfhIogAqpkEIoL4oI4pdCIehosgPKhddlxEPAwXQRhQrxy4i3gYLoJgUKMoRiIehovAL9SlkpiKKKHTAFAO6o8GbyIehovADGqOHs8iKujcAFjeFZT4F1FC1wHyCXXDE0FFBCAUICJgAUQELICIgAX/DwT/i3m5ddpQAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,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>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,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>

[image10]: <data:image/png;base64,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>
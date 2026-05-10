# exercise_bank.py

# The complete 7-Level Sinhala Phonetic Curriculum
# Format: "text" is what the UI shows, "target" is what the Grader expects.

sinhala_exercises = {
    1: [
        # Level 1: Simple open syllables (Consonant + Vowel)
        {"text": "මම", "target": "ma ma"},
        {"text": "ගස", "target": "ga sa"},
        {"text": "එක", "target": "e ka"},
        {"text": "අපි", "target": "a pi"},
        {"text": "මල", "target": "ma la"}
    ],
    
    2: [
        # Level 2: Long vowels & Hal Kirima (Holding and stopping sounds)
        {"text": "අම්මා", "target": "a m maa"},
        {"text": "තාත්තා", "target": "thaa th thaa"},
        {"text": "පාර", "target": "paa ra"},
        {"text": "බල්ලා", "target": "ba l laa"},
        {"text": "ගසක්", "target": "ga sa k"}
    ],
    
    3: [
        # Level 3: Complex consonants (Sanyaka, Yansaya, Maha Prana)
        {"text": "විද්‍යාලය", "target": "vi d yaa la ya"},
        {"text": "ආයුබෝවන්", "target": "aa y u b oo wa n"},
        {"text": "හඳ", "target": "ha nda"},
        {"text": "ප්‍රශ්නය", "target": "p ra sh na ya"},
        {"text": "ගඟ", "target": "ga nga"}
    ],
    
    4: [
        # Level 4: Simple Sentences (Testing flow between simple words)
        {"text": "මම ගෙදර ආවා", "target": "ma ma ge da ra aa waa"},
        {"text": "ඇය ලස්සනයි", "target": "ae ya la s sa na yi"},
        {"text": "අපි සෙල්ලම් කරමු", "target": "a pi se l la m ka ra mu"},
        {"text": "මම බත් කෑවා", "target": "ma ma ba th kae waa"}
    ],
    
    5: [
        # Level 5: Medium Sentences (Testing flow with complex consonants included)
        {"text": "මම පාසල් යන්න කැමතියි", "target": "ma ma paa sa l ya n na kae ma thi yi"},
        {"text": "අද කාලගුණය ගොඩක් හොඳයි", "target": "a da kaa la gu na ya go da k ho nda yi"},
        {"text": "මගේ යහළුවා හෙට එනවා", "target": "ma gee ya ha lu waa he ta e na waa"}
    ],
    
    6: [
        # Level 6: Hard/Formal Sentences (Literary Sinhala, precise breathing)
        {"text": "ශ්‍රී ලංකාව ඉතාමත් අලංකාර රටකි", "target": "sh rii la ng kaa wa i thaa ma th a la ng kaa ra ra ta ki"},
        {"text": "තාක්ෂණය වේගයෙන් දියුණු වෙමින් පවතී", "target": "thaa k sha na ya wee ga ye n di yu nu we mi n pa wa thii"},
        {"text": "අධ්‍යාපනය මිනිසාගේ අනාගතය හැඩගස්වයි", "target": "a dh yaa pa na ya mi ni saa gee a naa ga tha ya hae da ga s wa yi"}
    ],
    
    7: [
        # Level 7: Tongue Twisters & Speed Tests (Repeating similar phonemes)
        {"text": "රෝස මලක රෝස පෙති", "target": "roo sa ma la ka roo sa pe thi"},
        {"text": "ලොකු ළමයා ලිඳට වැටුණා", "target": "lo ku la ma yaa li nda ta wae tu naa"},
        {"text": "උඩ මඩමයි බිම මඩමයි", "target": "u da ma da ma yi bi ma ma da ma yi"},
        {"text": "කපුටු කාක් කාක් කාක්", "target": "ka pu tu kaa k kaa k kaa k"}
    ]
}
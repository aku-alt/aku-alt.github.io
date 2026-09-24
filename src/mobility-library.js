// Static local artwork and form guidance. Optional mobility, not a longevity prescription.
var MobilityLibrary = {
  "hip-flexor": {
    "title": "Half-kneeling hip flexor",
    "area": "HIPS",
    "cue": "Stay tall. Gently tuck your pelvis.",
    "detail": "Pad the kneeling knee. Shift forward slightly without arching your lower back; repeat on the other side.",
    "source": "Kent Community Health NHS",
    "url": "https://www.kentcht.nhs.uk/leaflet/stretching-exercises/",
    "bilateral": false,
    "alt": "Side view of an athlete in a half-kneeling lunge, torso upright and hands supported on the front thigh."
  },
  "figure-four": {
    "title": "Supine figure four",
    "area": "HIPS · GLUTES",
    "cue": "Draw the thigh in—not the knee.",
    "detail": "Cross one ankle over the opposite thigh. Hold behind the supporting thigh and gently draw it toward you. Keep your head down.",
    "source": "NHS",
    "url": "https://www.nhs.uk/live-well/exercise/how-to-stretch-after-exercising/",
    "bilateral": false,
    "alt": "Athlete lying on his back, one ankle crossed over the opposite thigh, hands behind the supporting thigh."
  },
  "adductor": {
    "title": "Butterfly stretch",
    "area": "INNER THIGHS",
    "cue": "Sit tall. Let the knees relax.",
    "detail": "Bring your soles together and allow the knees to open. Do not push them down. Use cushions under the knees if needed.",
    "source": "Hinge Health",
    "url": "https://www.hingehealth.io/resources/articles/butterfly-stretch/",
    "bilateral": true,
    "alt": "Athlete seated upright with soles together, knees open and hands around the ankles."
  },
  "hamstring": {
    "title": "Strap hamstring stretch",
    "area": "BACK OF THIGHS",
    "cue": "Lift gently. Keep a soft knee.",
    "detail": "Lie on your back with a strap around one foot. Raise that leg within a comfortable range; keep your head down. Repeat on the other side.",
    "source": "Physitrack",
    "url": "https://us.physitrack.com/home-exercise-video/hamstring-stretch-with-strap",
    "bilateral": false,
    "alt": "Supine athlete holding a strap around one raised foot; the other knee is bent and foot rests on the floor."
  },
  "quad": {
    "title": "Supported quad stretch",
    "area": "FRONT OF THIGHS",
    "cue": "Knees close. Keep your back neutral.",
    "detail": "Hold a stable support and bring one heel toward your bottom. Avoid twisting the knee or leaning backward; repeat on the other side.",
    "source": "Kent Community Health NHS",
    "url": "https://www.kentcht.nhs.uk/leaflet/stretching-exercises/",
    "bilateral": false,
    "alt": "Standing athlete supporting himself against a wall while holding one ankle behind him, knees close."
  },
  "calf-wall": {
    "title": "Straight-knee calf stretch",
    "area": "CALVES · ANKLES",
    "cue": "Back knee straight. Heel stays down.",
    "detail": "Place your hands on a wall and step one foot back. Lean forward without lifting the rear heel; repeat on the other side.",
    "source": "Kent Community Health NHS",
    "url": "https://www.kentcht.nhs.uk/leaflet/stretching-exercises/",
    "bilateral": false,
    "alt": "Athlete leaning into a wall, front knee bent, back knee straight and rear heel on the floor."
  },
  "soleus-wall": {
    "title": "Bent-knee calf stretch",
    "area": "LOWER CALVES · ANKLES",
    "cue": "Bend the back knee. Keep the heel down.",
    "detail": "Use a shorter wall-supported stance. Bend the rear knee while keeping that heel grounded; repeat on the other side.",
    "source": "Kent Community Health NHS",
    "url": "https://www.kentcht.nhs.uk/leaflet/stretching-exercises/",
    "bilateral": false,
    "alt": "Athlete in a short wall-supported stance, both knees bent and the rear heel kept on the floor."
  },
  "open-book": {
    "title": "Open-book rotation",
    "area": "UPPER BACK",
    "cue": "Open your chest. Keep knees stacked.",
    "detail": "Lie on your side with knees bent together. Sweep the top arm open and let your gaze follow, without forcing the hand to the floor. Return slowly.",
    "source": "Leeds Teaching Hospitals NHS",
    "url": "https://www.leedsth.nhs.uk/patients/resources/physiotherapy-exercises-for-breast-pain-with-chest-wall-musculoskeletal-symptoms/",
    "bilateral": false,
    "alt": "Side-lying athlete with bent knees stacked, chest rotating open and top arm reaching diagonally behind him."
  },
  "lat-reach": {
    "title": "Supported lat reach",
    "area": "LATS · SHOULDERS",
    "cue": "Hips back. Reach without arching.",
    "detail": "Kneel in front of a stable bench and rest your hands on it. Ease your hips back while keeping your ribs controlled. This is a supported kneeling variation.",
    "source": "Dynamic Health NHS",
    "url": "https://dynamichealth.nhs.uk/help-and-advice/mid-back-pain/",
    "bilateral": true,
    "alt": "Athlete kneeling before a low stable bench, hands reaching forward on its top and hips moving back."
  },
  "doorway-chest": {
    "title": "Doorway chest stretch",
    "area": "CHEST · SHOULDERS",
    "cue": "Turn gently away. No shoulder pinch.",
    "detail": "Rest one forearm against a door frame with the elbow around shoulder height. Turn away slightly until you feel a comfortable chest stretch; repeat on the other side.",
    "source": "Memorial Sloan Kettering",
    "url": "https://www.mskcc.org/cancer-care/patient-education/stretching-exercises-gvhd",
    "bilateral": false,
    "alt": "Athlete standing beside a door frame with one forearm supported, torso turning gently away."
  },
  "cross-body": {
    "title": "Cross-body shoulder",
    "area": "BACK OF SHOULDERS",
    "cue": "Support the upper arm—not the elbow.",
    "detail": "Bring one arm across your chest. Use the other hand above the elbow to guide it, keeping the shoulder relaxed. Repeat on the other side.",
    "source": "AAOS OrthoInfo",
    "url": "https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program/",
    "bilateral": false,
    "alt": "Athlete bringing an arm across his chest, opposite hand supporting the upper arm above the elbow."
  },
  "triceps": {
    "title": "Overhead triceps",
    "area": "UPPER ARMS · SHOULDERS",
    "cue": "Elbow up. Ribs stay down.",
    "detail": "Raise one arm and bend the elbow so the hand moves behind your head. Support that elbow gently with the other hand; repeat on the other side.",
    "source": "MedlinePlus",
    "url": "https://medlineplus.gov/ency/imagepages/19488.htm",
    "bilateral": false,
    "alt": "Athlete with one arm overhead and elbow bent, opposite hand gently supporting the raised elbow."
  },
  "cat-cow": {
    "title": "Cat–cow mobility",
    "area": "SPINE",
    "cue": "Slowly round, then gently release.",
    "detail": "From hands and knees, alternate a comfortable rounded back with a gentle arch. Move without forcing your neck or lower back. The image shows the rounded phase only.",
    "source": "Berkshire Healthcare NHS",
    "url": "https://www.berkshirehealthcare.nhs.uk/advice/mid-back-pain",
    "bilateral": true,
    "alt": "Athlete on hands and knees demonstrating the rounded-back phase of cat-cow; a static image, not a full movement sequence."
  },
  "wrist-flexor": {
    "title": "Wrist-flexor stretch",
    "area": "FOREARMS · WRISTS",
    "cue": "Ease the palm back. Keep the elbow soft.",
    "detail": "Extend one arm with the palm facing away. Use the other hand for light assistance into wrist extension. Stop if you feel tingling or pain; repeat on the other side.",
    "source": "AAOS OrthoInfo",
    "url": "https://orthoinfo.aaos.org/globalassets/pdfs/2022-therapeutic-exercise-program-for-carpal-tunnel.pdf",
    "bilateral": false,
    "alt": "Athlete extending one arm, palm facing away in a stop-sign position, with the other hand gently supporting it."
  },
  "neck-side": {
    "title": "Gentle neck side-bend",
    "area": "NECK",
    "cue": "Ear toward shoulder. No pulling.",
    "detail": "Keep both shoulders relaxed as you tilt your head a little to one side. Return slowly and repeat on the other side. Stop for pain or dizziness.",
    "source": "Cambridge University Hospitals NHS",
    "url": "https://www.cuh.nhs.uk/patient-information/neck-exercises-and-advice/",
    "bilateral": false,
    "alt": "Athlete with shoulders relaxed and level, head tilted slightly to one side, hands relaxed without pulling on the head."
  }
};
if(typeof module!=='undefined' && module.exports)module.exports=MobilityLibrary;

export interface VocabAnnotation {
  term: string;
  wordId: string;
  type?: string;
  meaningVi: string;
  phonetic?: string;
}

export interface ReadingParagraph {
  id: string; // 'A' | 'B' | ... | 'G'
  text: string;
  vocabNotes: VocabAnnotation[];
}

export interface MatchingQuestion {
  id: number;
  statement: string;
  answer: string; // 'A' - 'G'
  explanation: string;
}

export interface SummaryBlank {
  id: number; // 5, 6, 7, 8, 9, 10
  answer: string; // 'J', 'K', 'C', 'F', 'D', 'G'
  label: string; // The country / place name
  explanation: string;
}

export interface TFNGQuestion {
  id: number; // 11, 12, 13
  statement: string;
  answer: 'TRUE' | 'FALSE' | 'NOT GIVEN';
  explanation: string;
}

export interface SummaryOption {
  code: string;
  text: string;
}

export const PEARLS_DOC_URL = 'https://docs.google.com/document/d/1W4XZOmiMoczEIHUuxEfrHW_VCGLB74vJO4thnFO7gxI/edit?tab=t.0';
export const GITHUB_REPO_URL = 'https://github.com/thunopro/english';

export const READING_PASSAGE: {
  title: string;
  subtitle: string;
  paragraphs: ReadingParagraph[];
} = {
  title: 'READING 01: 🧾 Pearls',
  subtitle: 'IELTS Academic Reading: Lịch sử, Quá trình nuôi cấy & Giá trị của Ngọc Trai',
  paragraphs: [
    {
      id: 'A',
      text: `Long known as the “Queen of Gems,” pearls possess a history and allure far beyond what today’s wearer may recognize. Throughout much of recorded history, a natural pearl necklace comprised of matched spheres was a treasure of almost incomparable value - in fact, the most expensive jewelry in the world. Before the creation of cultured pearls in the early 1900s, natural pearls were so rare and expensive that they were reserved almost exclusively for the noble and very rich. The ancient Egyptians were particularly fond of their pearls. Many Egyptian leaders treasured pearls so much that they were often buried along with their cherished pearl collection. In the Orient and Persian Empire, pearls were ground into costly powders to cure anything from heart disease to epilepsy, with possible aphrodisiac uses as well. China’s long recorded history also provides ample evidence of the importance of pearls.`,
      vocabNotes: [
        {
          term: 'to be fond of sth',
          wordId: 'fond',
          type: 'Phrase',
          meaningVi: 'thích thú, yêu thích cái gì',
          phonetic: '/fɒnd/'
        },
        {
          term: 'treasure',
          wordId: 'treasure',
          type: 'N / V',
          meaningVi: 'kho báu (N) / trân quý, coi như bảo vật (V)',
          phonetic: '/ˈtreʒ.ər/'
        },
        {
          term: 'cherished',
          wordId: 'cherished',
          type: 'Adj',
          meaningVi: 'yêu quý, trân trọng',
          phonetic: '/ˈtʃer.ɪʃt/'
        },
        {
          term: 'ample',
          wordId: 'ample',
          type: 'Adj',
          meaningVi: 'nhiều, phong phú, thừa thãi',
          phonetic: '/ˈæm.pəl/'
        }
      ]
    },
    {
      id: 'B',
      text: `Pearls usually fall into three categories - natural pearls, cultured pearls, and simulated pearls. A natural pearl forms when an irritant, such as a piece of sand, works its way into a particular species of oyster, mussel, or clam. As a defense mechanism, the mollusk secretes a fluid to coat the irritant. Layer upon layer of this coating is deposited on the irritant until a lustrous pearl is formed. A cultured pearl undergoes the same process. The only difference between natural pearls and cultured pearls is that the irritant is a surgically implanted bead or piece of shell called Mother of Pearl. Often, these shells are ground oyster shells that are worth significant amounts of money in their own right as irritant-catalysts for quality pearls. The resulting core is much larger than in a natural pearl. Imitation pearls are a different story altogether. In most cases, a glass bead is dipped into a solution made from fish scales. This coating is thin and may eventually wear off. One can usually tell an imitation by biting on it. The island of Mallorca in Spain is known for its imitation pearl industry.`,
      vocabNotes: [
        {
          term: 'implant',
          wordId: 'implant',
          type: 'Verb',
          meaningVi: 'cấy ghép, đưa vào bên trong phẫu thuật',
          phonetic: '/ɪmˈplɑːnt/'
        },
        {
          term: 'catalyst',
          wordId: 'catalyst',
          type: 'Noun',
          meaningVi: 'chất xúc tác, nhân tố kích hoạt',
          phonetic: '/ˈkæt.əl.ɪst/'
        },
        {
          term: 'imitation',
          wordId: 'imitation',
          type: 'Adj / Noun',
          meaningVi: 'giả tạo, đồ mô phỏng',
          phonetic: '/ˌɪm.ɪˈteɪ.ʃən/'
        },
        {
          term: 'lustrous',
          wordId: 'lustrous',
          type: 'Adj',
          meaningVi: 'óng ánh, sáng bóng rực rỡ',
          phonetic: '/ˈlʌs.trəs/'
        },
        {
          term: 'secrete',
          wordId: 'secrete',
          type: 'Verb',
          meaningVi: 'tiết ra (chất dịch sinh học)',
          phonetic: '/sɪˈkriːt/'
        }
      ]
    },
    {
      id: 'C',
      text: `Regardless of the method used to acquire a pearl, the process usually takes several years. Mussels must reach a mature age, which can take up to three years, and then be implanted or naturally receive an irritant. Once the irritant is in place, it can take up to another three years for the pearl to reach its full size. Often, the irritant may be rejected, the pearl will be terrifically misshapen, or the oyster may simply die from disease or countless other complications. By the end of a five- to ten-year cycle, only 50% of the oysters will have survived. And of the pearls produced, only approximately 5% are of a quality substantial enough for top jewelry makers.`,
      vocabNotes: [
        {
          term: 'irritate sb',
          wordId: 'irritate',
          type: 'Verb',
          meaningVi: 'khiến ai bực bội, gây kích ứng mô',
          phonetic: '/ˈɪr.ɪ.teɪt/'
        },
        {
          term: 'irritation',
          wordId: 'irritation',
          type: 'Noun',
          meaningVi: 'sự kích ứng, viêm nhiễm khó chịu',
          phonetic: '/ˌɪr.ɪˈteɪ.ʃən/'
        },
        {
          term: 'irritant',
          wordId: 'irritant',
          type: 'Noun',
          meaningVi: 'vật gây kích ứng (hạt cát, mảnh vỏ)',
          phonetic: '/ˈɪr.ɪ.tənt/'
        },
        {
          term: 'contamination / contaminant',
          wordId: 'contamination',
          type: 'Noun',
          meaningVi: 'sự ô nhiễm / vật gây ô nhiễm',
          phonetic: '/kənˌtæm.ɪˈneɪ.ʃən/'
        },
        {
          term: 'misshapen',
          wordId: 'misshapen',
          type: 'Adj',
          meaningVi: 'méo mó, dị dạng, không cân xứng',
          phonetic: '/mɪsˈʃeɪ.pənd/'
        },
        {
          term: 'complication',
          wordId: 'complication',
          type: 'Noun',
          meaningVi: 'hệ quả tiêu cực, biến chứng phức tạp',
          phonetic: '/ˌkɒm.plɪˈkeɪ.ʃən/'
        }
      ]
    },
    {
      id: 'D',
      text: `How can untrained eyes determine a pearl’s worth? Luster and size are generally considered the two main factors to look for. Luster, for instance, depends on the fineness and evenness of the layers. The deeper the glow, the more perfect the shape and surface, the more valuable they are. Size, on the other hand, has to do with the age of the oyster that created the pearl (the more mature oysters produce larger pearls) and the location in which the pearl was cultured. The South Sea waters of Australia tend to produce larger pearls, probably because the water along the coastline is supplied with rich nutrients from the ocean floor. Also, the type of mussel being common to the area seems to possess a predilection for producing comparatively large pearls.`,
      vocabNotes: [
        {
          term: 'a predilection for doing sth',
          wordId: 'predilection',
          type: 'Noun',
          meaningVi: 'thiên hướng, xu hướng ưa thích đặc biệt',
          phonetic: '/ˌpriː.dɪˈlek.ʃən/'
        },
        {
          term: 'to be supplied with',
          wordId: 'supplied-with',
          type: 'Phrase',
          meaningVi: 'được cung cấp cái gì (= to be provided with sth)',
          phonetic: '/səˈplaɪd wɪð/'
        }
      ]
    },
    {
      id: 'E',
      text: `In general, cultured pearls are less valuable than natural pearls, whereas imitation pearls have almost no value. One way that jewelers can determine whether a pearl is cultured or natural is to have a gem lab perform an X-ray of the pearl. If the X-ray reveals a nucleus, the pearl is likely a bead-nucleated saltwater pearl. If no nucleus is present, but irregular and small dark inner spots indicating a cavity are visible, combined with concentric rings of organic substance, the pearl is likely a cultured freshwater pearl. Among cultured pearls, Akoya pearls from Japan are some of the most lustrous. Although imitation pearls look the part, they do not have the same weight or smoothness as real pearls, and their luster will also dim greatly.`,
      vocabNotes: [
        {
          term: 'concentric',
          wordId: 'concentric',
          type: 'Adj',
          meaningVi: 'đồng tâm (cùng chung một tâm điểm)',
          phonetic: '/kənˈsen.trɪk/'
        },
        {
          term: 'cavity',
          wordId: 'cavity',
          type: 'Noun',
          meaningVi: 'khoang rỗng, hốc bên trong',
          phonetic: '/ˈkæv.ə.ti/'
        }
      ]
    },
    {
      id: 'F',
      text: `Historically, the world’s best pearls came from the Persian Gulf, especially around what is now Bahrain. The pearls of the Persian Gulf were naturally created and collected by breath-hold divers. Unfortunately, the natural pearl industry of the Persian Gulf ended abruptly in the early 1930s with the discovery of large deposits of oil. The water pollution resulting from spilled oil and indiscriminate overfishing of oysters essentially ruined the pristine waters of the Gulf that once produced pearls. Still, Bahrain remains one of the foremost trading centers for high-quality pearls. In fact, cultured pearls are banned from the Bahrain pearl market, in an effort to preserve the location’s heritage. Nowadays, the largest stock of natural pearls probably resides in India. Ironically, much of India’s stock of natural pearls came originally from Bahrain. Unlike Bahrain, which has essentially lost its pearl resource, traditional pearl fishing is still practiced on a small scale in India.`,
      vocabNotes: [
        {
          term: 'indiscriminate',
          wordId: 'indiscriminate',
          type: 'Adj',
          meaningVi: 'bừa bãi, vô tội vạ, không suy tính',
          phonetic: '/ˌɪn.dɪˈskrɪm.ɪ.nət/'
        },
        {
          term: 'pristine',
          wordId: 'pristine',
          type: 'Adj',
          meaningVi: 'nguyên thuỷ, hoang sơ, trong lành',
          phonetic: '/ˈprɪs.tiːn/'
        }
      ]
    },
    {
      id: 'G',
      text: `Pearls also come in many colors. The most popular colors are white, cream, and pink. Silver, black, and gold are also gaining interest. In fact, a deep lustrous black pearl is one of the rarest finds in the pearling industry, usually only being found in the South Sea near Australia. Thus, they can be one of the more costly items. Nowadays, pearls predominantly come from Japan, Australia, Indonesia, Myanmar, China, India, the Philippines, and Tahiti. Japan, however, controls roughly 80% of the world pearl market, with Australia and China coming in second and third, respectively.`,
      vocabNotes: [
        {
          term: 'predominantly',
          wordId: 'predominantly',
          type: 'Adv',
          meaningVi: 'phần lớn, chủ yếu, chiếm ưu thế',
          phonetic: '/prɪˈdɒm.ɪ.nənt.li/'
        },
        {
          term: 'glistening',
          wordId: 'glistening',
          type: 'Adj',
          meaningVi: 'sáng bóng, lấp lánh (= lustrous)',
          phonetic: '/ˈɡlɪs.ən.ɪŋ/'
        }
      ]
    }
  ]
};

export const MATCHING_QUESTIONS: MatchingQuestion[] = [
  {
    id: 1,
    statement: 'difficulties in the cultivation process',
    answer: 'C',
    explanation: 'Đoạn C giải thích quy trình nuôi cấy mất nhiều năm, hàu có thể chết vì bệnh tật hoặc biến chứng (complications), chỉ 50% sống sót và chỉ 5% đạt chuẩn.'
  },
  {
    id: 2,
    statement: 'causes affecting the size of natural pearls',
    answer: 'D',
    explanation: 'Đoạn D nêu rõ: "Size... has to do with the age of the oyster that created the pearl... and the location in which the pearl was cultured (rich nutrients from ocean floor)".'
  },
  {
    id: 3,
    statement: 'ancient customs around pearls',
    answer: 'A',
    explanation: 'Đoạn A kể về người Ai Cập cổ chôn cất ngọc trai cùng người chết, và người Ba Tư/phương Đông nghiền ngọc thành bột thuốc trị bệnh.'
  },
  {
    id: 4,
    statement: 'distinctions between cultured pearls and natural ones',
    answer: 'B',
    explanation: 'Đoạn B chỉ ra điểm khác biệt duy nhất giữa ngọc tự nhiên và ngọc nuôi: dị vật được cấy ghép phẫu thuật, dẫn đến phần nhân lõi lớn hơn nhiều so với ngọc tự nhiên.'
  }
];

export const SUMMARY_OPTIONS: SummaryOption[] = [
  { code: 'A', text: 'America' },
  { code: 'B', text: 'Philippines' },
  { code: 'C', text: 'Australia' },
  { code: 'D', text: 'Bahrain' },
  { code: 'E', text: 'China' },
  { code: 'F', text: 'Japan' },
  { code: 'G', text: 'India' },
  { code: 'H', text: 'Egypt' },
  { code: 'I', text: 'Myanmar' },
  { code: 'J', text: 'Persia' },
  { code: 'K', text: 'Mallorca' }
];

export const SUMMARY_BLANKS: SummaryBlank[] = [
  {
    id: 5,
    answer: 'J',
    label: 'Persia',
    explanation: 'Đoạn A: "In the Orient and Persian Empire, pearls were ground into costly powders to cure anything from heart disease to epilepsy..."'
  },
  {
    id: 6,
    answer: 'K',
    label: 'Mallorca',
    explanation: 'Đoạn B: "The island of Mallorca in Spain is known for its imitation pearl industry."'
  },
  {
    id: 7,
    answer: 'C',
    label: 'Australia',
    explanation: 'Đoạn D: "The South Sea waters of Australia tend to produce larger pearls, probably because the water along the coastline is supplied with rich nutrients..."'
  },
  {
    id: 8,
    answer: 'F',
    label: 'Japan',
    explanation: 'Đoạn E: "Among cultured pearls, Akoya pearls from Japan are some of the most lustrous (glistening)."'
  },
  {
    id: 9,
    answer: 'D',
    label: 'Bahrain',
    explanation: 'Đoạn F: "Historically, the world’s best pearls came from the Persian Gulf, especially around what is now Bahrain."'
  },
  {
    id: 10,
    answer: 'G',
    label: 'India',
    explanation: 'Đoạn F: "Nowadays, the largest stock of natural pearls probably resides in India."'
  }
];

export const TFNG_QUESTIONS: TFNGQuestion[] = [
  {
    id: 11,
    statement: 'A cultured pearl’s center is often significantly larger than that in a natural pearl.',
    answer: 'TRUE',
    explanation: 'Đoạn B nêu rõ: "The resulting core is much larger than in a natural pearl." -> TRUE.'
  },
  {
    id: 12,
    statement: 'Imitation pearls are usually the same price as natural ones.',
    answer: 'FALSE',
    explanation: 'Đoạn E nêu: "whereas imitation pearls have almost no value", trái ngược với ngọc tự nhiên đắt giá bậc nhất thế giới -> FALSE.'
  },
  {
    id: 13,
    statement: 'Akoya pearls from Japan glow more deeply than South Sea pearls from Australia.',
    answer: 'NOT GIVEN',
    explanation: 'Bài đọc chỉ nhắc Akoya pearls "are some of the most lustrous" và South Sea pearls "produce larger pearls", không hề có sự so sánh về độ sâu của ánh sáng (glow more deeply) giữa hai loại này -> NOT GIVEN.'
  }
];

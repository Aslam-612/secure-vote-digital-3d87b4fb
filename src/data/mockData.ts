export interface Election {
  id: string;
  title: string;
  titleTa: string;
  type: 'college' | 'corporate' | 'public' | 'organization';
  status: 'active' | 'upcoming' | 'completed';
  startTime: string;
  endTime: string;
  totalVoters: number;
  votesCast: number;
}

export interface Candidate {
  id: string;
  name: string;
  nameTa: string;
  party: string;
  partyTa: string;
  description: string;
  descriptionTa: string;
  electionId: string;
  votes: number;
  photo: string;
}

export interface Voter {
  id: string;
  name: string;
  mobile: string;
  voterId: string;
  hasVoted: boolean;
  electionId: string;
  registeredAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  voterId: string;
  timestamp: string;
  ipAddress: string;
}

export const elections: Election[] = [
  {
    id: 'e1',
    title: 'CSE Department CR Election 2025',
    titleTa: 'CSE துறை CR தேர்தல் 2025',
    type: 'college',
    status: 'active',
    startTime: '2025-03-15T09:00:00',
    endTime: '2025-03-15T17:00:00',
    totalVoters: 120,
    votesCast: 78,
  },
  {
    id: 'e2',
    title: 'Student Council Election 2025',
    titleTa: 'மாணவர் சபை தேர்தல் 2025',
    type: 'college',
    status: 'active',
    startTime: '2025-03-20T08:00:00',
    endTime: '2025-03-20T18:00:00',
    totalVoters: 500,
    votesCast: 312,
  },
  {
    id: 'e3',
    title: 'Board of Directors Election 2025',
    titleTa: 'இயக்குநர் குழு தேர்தல் 2025',
    type: 'corporate',
    status: 'upcoming',
    startTime: '2025-04-10T10:00:00',
    endTime: '2025-04-10T16:00:00',
    totalVoters: 45,
    votesCast: 0,
  },
  {
    id: 'e4',
    title: 'Ward 12 Constituency Election 2025',
    titleTa: 'வார்டு 12 தொகுதி தேர்தல் 2025',
    type: 'public',
    status: 'upcoming',
    startTime: '2025-05-01T07:00:00',
    endTime: '2025-05-01T19:00:00',
    totalVoters: 15000,
    votesCast: 0,
  },
];

export const candidates: Candidate[] = [
  {
    id: 'c1', name: 'Arun Kumar', nameTa: 'அருண் குமார்',
    party: 'Student Progress Alliance', partyTa: 'மாணவர் முன்னேற்றக் கூட்டணி',
    description: 'Committed to improving lab facilities and digital learning resources.',
    descriptionTa: 'ஆய்வக வசதிகள் மற்றும் டிஜிட்டல் கற்றல் வளங்களை மேம்படுத்த உறுதிபூண்டவர்.',
    electionId: 'e1', votes: 34, photo: '',
  },
  {
    id: 'c2', name: 'Priya Sharma', nameTa: 'பிரியா சர்மா',
    party: 'Tech Forward Party', partyTa: 'தொழில்நுட்ப முன்னணிக் கட்சி',
    description: 'Focus on hackathons, industry connections, and placement support.',
    descriptionTa: 'ஹேக்கத்தான்கள், தொழில் தொடர்புகள் மற்றும் வேலைவாய்ப்பு ஆதரவில் கவனம்.',
    electionId: 'e1', votes: 28, photo: '',
  },
  {
    id: 'c3', name: 'Karthik Raja', nameTa: 'கார்த்திக் ராஜா',
    party: 'Independent', partyTa: 'சுயேச்சை',
    description: 'Advocating for better sports facilities and cultural events.',
    descriptionTa: 'சிறந்த விளையாட்டு வசதிகள் மற்றும் கலாச்சார நிகழ்வுகளுக்காக வாதிடுகிறார்.',
    electionId: 'e1', votes: 16, photo: '',
  },
  {
    id: 'c4', name: 'Deepa Venkatesh', nameTa: 'தீபா வெங்கடேஷ்',
    party: 'Unity Front', partyTa: 'ஒற்றுமை முன்னணி',
    description: 'Experienced student leader with focus on academic excellence.',
    descriptionTa: 'கல்வி சிறப்பில் கவனம் செலுத்தும் அனுபவமிக்க மாணவர் தலைவர்.',
    electionId: 'e2', votes: 156, photo: '',
  },
  {
    id: 'c5', name: 'Rahul Nair', nameTa: 'ராகுல் நாயர்',
    party: 'Campus Revolution', partyTa: 'வளாக புரட்சி',
    description: 'Bringing innovation and transparency to student governance.',
    descriptionTa: 'மாணவர் ஆளுமையில் புதுமை மற்றும் வெளிப்படைத்தன்மையை கொண்டு வருகிறார்.',
    electionId: 'e2', votes: 98, photo: '',
  },
  {
    id: 'c6', name: 'Sneha Patel', nameTa: 'ஸ்நேகா படேல்',
    party: 'Green Campus Initiative', partyTa: 'பசுமை வளாக முயற்சி',
    description: 'Sustainable campus, mental health awareness, and inclusivity.',
    descriptionTa: 'நிலையான வளாகம், மன நல விழிப்புணர்வு மற்றும் உள்ளடக்கம்.',
    electionId: 'e2', votes: 58, photo: '',
  },
];

export const voters: Voter[] = [
  { id: 'v1', name: 'Ramesh S', mobile: '9876543210', voterId: 'CSE2025001', hasVoted: true, electionId: 'e1', registeredAt: '2025-03-01' },
  { id: 'v2', name: 'Lakshmi R', mobile: '9876543211', voterId: 'CSE2025002', hasVoted: true, electionId: 'e1', registeredAt: '2025-03-01' },
  { id: 'v3', name: 'Suresh K', mobile: '9876543212', voterId: 'CSE2025003', hasVoted: false, electionId: 'e1', registeredAt: '2025-03-02' },
  { id: 'v4', name: 'Meena P', mobile: '9876543213', voterId: 'SC2025001', hasVoted: true, electionId: 'e2', registeredAt: '2025-03-05' },
  { id: 'v5', name: 'Vijay M', mobile: '9876543214', voterId: 'SC2025002', hasVoted: false, electionId: 'e2', registeredAt: '2025-03-05' },
];

export const auditLogs: AuditLog[] = [
  { id: 'a1', action: 'VOTE_CAST', voterId: 'v1', timestamp: '2025-03-15T10:23:45', ipAddress: '192.168.1.100' },
  { id: 'a2', action: 'OTP_VERIFIED', voterId: 'v1', timestamp: '2025-03-15T10:22:30', ipAddress: '192.168.1.100' },
  { id: 'a3', action: 'OTP_SENT', voterId: 'v1', timestamp: '2025-03-15T10:22:00', ipAddress: '192.168.1.100' },
  { id: 'a4', action: 'VOTE_CAST', voterId: 'v2', timestamp: '2025-03-15T11:05:12', ipAddress: '192.168.1.101' },
  { id: 'a5', action: 'LOGIN_FAILED', voterId: 'v3', timestamp: '2025-03-15T12:00:00', ipAddress: '10.0.0.55' },
  { id: 'a6', action: 'OTP_RESEND', voterId: 'v3', timestamp: '2025-03-15T12:01:00', ipAddress: '10.0.0.55' },
];

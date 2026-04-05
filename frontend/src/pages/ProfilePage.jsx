import { Mail, MapPin, ExternalLink } from 'lucide-react'
import avatarImg from '../assets/avatar.jpg'


const user = {
  name:     'Nguyễn Gia Việt Anh',
  role:     'Frontend Developer',
  studentId: 'B22DCPT010',
  email:    'vietanh.nguyengia2004@gmail.com',
  location: 'Hanoi, Vietnam',
  avatar: avatarImg,
}

const projects = [
  {
    label: 'IoT Project Report:',
    url:   'https://docs.google.com/document/d/1F7LzBfBn3crr_0gjnN5M0dfY3SmUyMfgwxlUZx6ZV3Y/edit?tab=t.0#heading=h.sz7rmkyndus0',
    display: 'https://docs.google.com/document/d/1F7LzBfBn3crr_0gjnN5M0dfY3SmUyMfgwxlUZx6ZV3Y/edit?tab=t.0#heading=h.sz7rmkyndus0'
  },
  {
    label: 'API docs:',
    url:   'https://kurohiko2004.github.io/IoT-agriculture-system/',
    display:   'https://kurohiko2004.github.io/IoT-agriculture-system/',
  },
  {
    label: 'GitHub:',
    url:   'https://github.com/Kurohiko2004',
    display: 'https://github.com/Kurohiko2004',
  },
  {
    label: 'Figma:',
    url:   'https://www.figma.com/community/file/1594784452849579772',
    display: 'https://www.figma.com/community/file/1594784452849579772',
  },
]

export default function ProfilePage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left — User Card */}
      <div className="col-span-1 bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full bg-blue-500 overflow-hidden">
            {user.avatar
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
            }
          </div>
          {/* Online dot */}
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </div>

        {/* Name & role */}
        <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
        <p className="text-xs font-bold tracking-widest uppercase text-teal-500 mb-4">
          {user.role}
        </p>

        {/* Student ID */}
        <p className="text-sm text-gray-400 mb-6">{user.studentId}</p>

        {/* Contact info */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
            <Mail size={15} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5">
            <MapPin size={15} className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600">{user.location}</span>
          </div>
        </div>
      </div>

      {/* Right — Projects */}
      <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">My Projects</h2>
        <div className="flex flex-col gap-3">
          {projects.map(({ label, url, display }) => (
            <div
              key={label}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-5 py-4"
            >
              <p className="text-sm font-bold text-gray-800">
                {label}
                {display && (
                  <span className="font-normal text-gray-500 ml-1">{display}</span>
                )}
              </p>
              
              <a
                href={url || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                >
              
                <ExternalLink size={13} />
                Link
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
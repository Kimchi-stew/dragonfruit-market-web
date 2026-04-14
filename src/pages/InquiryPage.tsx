import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paperclip, Send, X, ChevronDown } from 'lucide-react'
import Button from '../components/ui/Button'
import Breadcrumb from '../components/ui/Breadcrumb'

const INQUIRY_TYPES = [
  '상품 문의',
  '배송 문의',
  '교환/반품 문의',
  '결제 문의',
  '계정 문의',
  '기타',
]

export default function InquiryPage() {
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [typeOpen, setTypeOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sent, setSent] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const added = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...added].slice(0, 3))
    e.target.value = ''
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 flex flex-col items-center gap-5 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.1)' }}
        >
          <Send size={28} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">문의가 접수되었습니다</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            빠른 시일 내에 답변 드리겠습니다.<br />
            답변은 마이페이지 &gt; 문의에서 확인하실 수 있습니다.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="ghost" onClick={() => navigate('/mypage')}>
            마이페이지로
          </Button>
          <Button onClick={() => { setSent(false); setSubject(''); setContent(''); setType(''); setFiles([]) }}>
            추가 문의하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 py-6">
      <Breadcrumb
        items={[{ label: '홈', to: '/' }, { label: '마이페이지', to: '/mypage' }, { label: '문의하기' }]}
      />

      {/* 메일 컨테이너 */}
      <div
        className="mt-6 rounded-2xl overflow-hidden border"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* 헤더 바 */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2">
            <Send size={15} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              새 문의 작성
            </span>
          </div>
          <button onClick={() => navigate(-1)}>
            <X size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 보내는 사람 */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs w-16 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
              보낸이
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              user@example.com
            </span>
          </div>

          {/* 받는 사람 */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs w-16 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
              받는이
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              support@dragonfruit-market.com
            </span>
          </div>

          {/* 문의 유형 */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b relative"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs w-16 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
              문의 유형
            </span>
            <button
              type="button"
              onClick={() => setTypeOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm"
              style={{ color: type ? 'var(--color-text-primary)' : 'var(--color-text-disabled)' }}
            >
              {type || '유형을 선택하세요'}
              <ChevronDown size={14} />
            </button>

            {typeOpen && (
              <div
                className="absolute top-full left-16 mt-1 w-44 rounded-xl border overflow-hidden z-10"
                style={{
                  borderColor: 'var(--color-border)',
                  background: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              >
                {INQUIRY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setType(t); setTypeOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F7F7F7]"
                    style={{
                      color: t === type ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: t === type ? 600 : 400,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 제목 */}
          <div
            className="flex items-center gap-3 px-5 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="text-xs w-16 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
              제목
            </span>
            <input
              type="text"
              required
              placeholder="문의 제목을 입력하세요"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>

          {/* 본문 */}
          <textarea
            required
            placeholder="문의 내용을 자세히 입력해 주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-5 py-4 text-sm outline-none resize-none bg-transparent leading-relaxed"
            style={{
              minHeight: 260,
              color: 'var(--color-text-primary)',
            }}
          />

          {/* 첨부파일 미리보기 */}
          {files.length > 0 && (
            <div
              className="flex flex-wrap gap-2 px-5 pb-3 border-t pt-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  <Paperclip size={11} />
                  <span className="max-w-[140px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="ml-0.5 hover:opacity-70"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 하단 액션 바 */}
          <div
            className="flex items-center justify-between px-5 py-3 border-t"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            {/* 첨부파일 */}
            <label className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Paperclip size={14} />
              <span>파일 첨부 (최대 3개)</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFile}
                disabled={files.length >= 3}
              />
            </label>

            {/* 전송 */}
            <Button type="submit" size="sm">
              <Send size={14} className="mr-1.5" />
              보내기
            </Button>
          </div>
        </form>
      </div>

      {/* 안내 */}
      <p className="text-xs mt-4 text-center" style={{ color: 'var(--color-text-disabled)' }}>
        영업일 기준 1~2일 이내 답변 드립니다. 답변은 마이페이지 &gt; 문의에서 확인하세요.
      </p>
    </div>
  )
}

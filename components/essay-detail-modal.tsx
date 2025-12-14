'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Essay, Comment } from '@/types/essay'
import Image from 'next/image'
import { useAdminMode } from '@/components/admin-mode'
import { Button } from '@/components/ui/button'
import { deleteEssay, likeEssay, unlikeEssay, getComments, createComment } from '@/lib/actions'
import { Textarea } from '@/components/ui/textarea'
import { HeartIcon, CommentIcon } from '@/components/icons'

interface EssayDetailModalProps {
  essay: Essay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stickerSrc?: string
  onDelete?: (essayId: string) => void
}

export function EssayDetailModal({
  essay,
  open,
  onOpenChange,
  stickerSrc,
  onDelete,
}: EssayDetailModalProps) {
  const { isAdmin } = useAdminMode()
  const [likesCount, setLikesCount] = useState(essay?.likes_count || 0)
  const [hasLiked, setHasLiked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [commentNickname, setCommentNickname] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  // 좋아요 상태 확인 (localStorage)
  useEffect(() => {
    if (!essay || typeof window === 'undefined') return
    
    const likedEssays = JSON.parse(localStorage.getItem('likedEssays') || '[]')
    setHasLiked(likedEssays.includes(essay.id))
    setLikesCount(essay.likes_count || 0)
  }, [essay])

  // 댓글 불러오기
  useEffect(() => {
    if (!essay || !open) return
    
    const loadComments = async () => {
      try {
        const loadedComments = await getComments(essay.id)
        setComments(loadedComments)
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
    
    loadComments()
  }, [essay, open])

  if (!essay) return null

  const handleLike = async () => {
    // 로딩 중이면 무시
    if (isLiking) return
    
    setIsLiking(true)
    
    try {
      let newCount: number
      
      if (hasLiked) {
        // 좋아요 취소
        newCount = await unlikeEssay(essay.id)
        setHasLiked(false)
        
        // localStorage에서 제거
        if (typeof window !== 'undefined') {
          const likedEssays = JSON.parse(localStorage.getItem('likedEssays') || '[]')
          const updatedLikedEssays = likedEssays.filter((id: string) => id !== essay.id)
          localStorage.setItem('likedEssays', JSON.stringify(updatedLikedEssays))
        }
      } else {
        // 좋아요 추가
        newCount = await likeEssay(essay.id)
        setHasLiked(true)
        
        // localStorage에 저장
        if (typeof window !== 'undefined') {
          const likedEssays = JSON.parse(localStorage.getItem('likedEssays') || '[]')
          if (!likedEssays.includes(essay.id)) {
            likedEssays.push(essay.id)
            localStorage.setItem('likedEssays', JSON.stringify(likedEssays))
          }
        }
      }
      
      setLikesCount(newCount)
      
      // 0.5초 동안 중복 클릭 방지
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error toggling like:', error)
      alert(hasLiked ? '좋아요를 취소하는 중 오류가 발생했습니다.' : '좋아요를 추가하는 중 오류가 발생했습니다.')
    } finally {
      setIsLiking(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return
    
    setIsSubmittingComment(true)
    try {
      const newComment = await createComment(
        essay.id,
        commentContent.trim(),
        commentNickname.trim() || undefined
      )
      setComments([...comments, newComment])
      setCommentContent('')
      setCommentNickname('')
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('이 수기를 삭제하시겠습니까?')) {
      try {
        await deleteEssay(essay.id)
        onDelete?.(essay.id)
        alert('수기가 삭제되었습니다.')
        onOpenChange(false)
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.')
        console.error(error)
      }
    }
  }

  const questions = [
    { label: '공부를 시작하게 된 계기는 무엇인가요?', answer: essay.q1 },
    { label: '시험 준비에 얼마나 시간을 들였나요?', answer: essay.q2 },
    { label: '나만의 공부 비법이나 꿀팁이 있다면 무엇인가요?', answer: essay.q3 },
    { label: '포기하고 싶을 때 어떻게 다시 마음을 다잡았나요?', answer: essay.q4 },
    { label: '내년에는 어떤 마음가짐으로 공부하고 싶나요?', answer: essay.q5 },
    { label: '천국고시 준비는 어떠셨나요?', answer: essay.q6 },
    { label: '응시 후 신앙의 변화가 있었다면 무엇인가요?', answer: essay.q7 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/30 to-blue-50/30">
        {stickerSrc && (
          <div className="absolute top-4 right-4 z-10 w-20 h-20">
            <Image
              src={stickerSrc}
              alt="Sticker"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </div>
        )}
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-600 text-lg md:text-xl">✍🏻</span>
                <span>{essay.nickname ? `${essay.nickname}님의 수기` : '익명의 수기'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-1 ml-2 !opacity-100 disabled:!opacity-100 border-gray-300 hover:!bg-gray-50 active:!bg-gray-50"
                >
                  <HeartIcon 
                    filled={hasLiked} 
                    className={`w-4 h-4 ${hasLiked ? 'text-red-500' : 'text-gray-400'}`} 
                  />
                  <span className="text-gray-700">{likesCount}</span>
                </Button>
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-600">
                {new Date(essay.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </DialogDescription>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {questions.map((q, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-blue-100/50 shadow-sm"
            >
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <span className="text-lg">
                  {index === 2 && '🔥'}
                  {index === 3 && '💪'}
                  {index === 4 && '⭐'}
                  {index === 5 && '📚'}
                  {index === 6 && '✨'}
                </span>
                {q.label}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {q.answer}
              </p>
            </div>
          ))}
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-6 pt-6 border-t border-gray-200 bg-white/90 backdrop-blur-md rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💬 댓글 ({comments.length})</h3>
          
          {/* 댓글 작성 폼 */}
          <div className="mb-4 space-y-2">
            <input
              type="text"
              placeholder="닉네임 (선택사항)"
              value={commentNickname}
              onChange={(e) => setCommentNickname(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Textarea
              placeholder="댓글을 작성해주세요..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={3}
              className="text-sm bg-white"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!commentContent.trim() || isSubmittingComment}
              size="sm"
              className="w-full"
            >
              {isSubmittingComment ? '작성 중...' : '댓글 작성'}
            </Button>
          </div>

          {/* 댓글 목록 */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4 bg-white/80 rounded-lg">아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-lg bg-white/95 backdrop-blur-sm border border-blue-200/70 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-800">
                      {comment.nickname || '익명'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


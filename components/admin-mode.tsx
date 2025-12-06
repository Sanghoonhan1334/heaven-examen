'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const ADMIN_PASSWORD = 'admin123' // 관리자 비밀번호 (나중에 변경 가능)

export function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const adminStatus = localStorage.getItem('adminMode') === 'true'
    setIsAdmin(adminStatus)
  }, [])

  const activateAdmin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('adminMode', 'true')
      setIsAdmin(true)
      return true
    }
    return false
  }

  const deactivateAdmin = () => {
    localStorage.removeItem('adminMode')
    setIsAdmin(false)
  }

  return { isAdmin, activateAdmin, deactivateAdmin }
}

export function AdminModeButton() {
  const { isAdmin, activateAdmin, deactivateAdmin } = useAdminMode()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleActivate = () => {
    if (activateAdmin(password)) {
      setIsDialogOpen(false)
      setPassword('')
      setError('')
    } else {
      setError('비밀번호가 올바르지 않습니다.')
    }
  }

  const handleDeactivate = () => {
    if (confirm('관리자 모드를 종료하시겠습니까?')) {
      deactivateAdmin()
    }
  }

  return (
    <>
      {isAdmin ? (
        <Button
          onClick={handleDeactivate}
          variant="destructive"
          size="sm"
          className="fixed top-4 left-4 z-50"
        >
          관리자 모드 종료
        </Button>
      ) : (
        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-50 opacity-50 hover:opacity-100"
        >
          관리자
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 모드 활성화</DialogTitle>
            <DialogDescription>
              비밀번호를 입력하여 관리자 모드를 활성화하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleActivate()
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleActivate}>확인</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


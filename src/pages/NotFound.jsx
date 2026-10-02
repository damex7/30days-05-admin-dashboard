import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Button, Card, EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <Card>
        <EmptyState
          title="There's nothing at this address"
          message="The link may be old, or the page may have moved."
          action={
            <Button as={Link} to="/" variant="primary">
              Go to the overview
            </Button>
          }
        />
      </Card>
    </>
  )
}

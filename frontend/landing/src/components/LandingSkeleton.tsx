import { Box, Skeleton, Container } from '@mui/material';

export function HeroSkeleton() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 8, md: 14 }, textAlign: 'center' }}>
      <Container maxWidth="md">
        <Skeleton variant="text" width={120} height={28} sx={{ mx: 'auto', mb: 3 }} />
        <Skeleton variant="text" width="80%" height={52} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="text" width="70%" height={52} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', mb: 5 }} />
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 8 }}>
          <Skeleton variant="rounded" width={200} height={48} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="rounded" width={160} height={48} sx={{ borderRadius: '12px' }} />
        </Box>
        <Skeleton variant="text" width={300} height={32} sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" width={240} height={20} sx={{ mx: 'auto' }} />
      </Container>
    </Box>
  );
}

export function CardsSkeleton() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={500} sx={{ borderRadius: '24px' }} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export function StatsSkeleton() {
  return (
    <Box sx={{ bgcolor: '#ffffff', py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: { xs: 3, md: 6 } }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={160} sx={{ borderRadius: '1rem' }} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export function TableSkeleton() {
  return (
    <Box sx={{ bgcolor: '#F8FAFC', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Skeleton variant="text" width={400} height={36} sx={{ mx: 'auto', mb: 6 }} />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px' }} />
      </Container>
    </Box>
  );
}

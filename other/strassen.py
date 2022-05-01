import numpy as np

A = np.matrix([[1, 2, 3, 4], [3, 4, 5, 6], [1, 2, 3, 4], [3, 4, 5, 6]])
B = np.matrix([[1, 2, 3, 4], [3, 4, 5, 6], [1, 2, 3, 4], [3, 4, 5, 6]])

def split(matrix, area):
  N = len(matrix)
  m = round(N / 2)

  if area == 1:
    #topleft
    return A[0:m, 0:m]
  elif area == 2:
    #topright
    return A[0:m, m:N]
  elif area == 3:
    #bottomleft
    return A[m:N, 0:m]
  elif area == 4:
    #bottomright
    return A[m:N, m:N]

def strassen(A, B):
  if (len(A) == 2):
    return A * B

  a11 = split(A, 1)
  a12 = split(A, 2)
  a21 = split(A, 3)
  a22 = split(A, 4)

  b11 = split(B, 1)
  b12 = split(B, 2)
  b21 = split(B, 3)
  b22 = split(B, 4)

  #m1 = (a11 + a22) * (b11 + b22)
  #m2 = (a21 + a22) * b11
  #m3 = a11 * (b12 - b22)
  #m4 = a22 * (b21 - b11)
  #m5 = (a11 + a12) * b22
  #m6 = (a21 - a11) * (b11 + b12)
  #m7 = (a12 - a22) * (b21 + b22)

  m1 = strassen(a11 + a22, b11 + b22)
  m2 = strassen(a21 + a22, b11)
  m3 = strassen(a11, b12 - b22)
  m4 = strassen(a22, b21 - b11)
  m5 = strassen(a11 + a12, b22)
  m6 = strassen(a21 - a11, b11 + b12)
  m7 = strassen(a12 - a22, b21 + b22)

  c1 = m1 + m4 - m5 + m7
  c2 = m3 + m5
  c3 = m2 + m4
  c4 = m1 - m2 + m3 + m6

  return np.vstack([np.hstack([c1, c2]), np.hstack([c3, c4])])

print(strassen(A, B))
result = A * B
print(result)
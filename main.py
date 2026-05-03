board = [" " for _ in range(9)]

def print_board():
    for i in range(3):
        print("|".join(board[i*3:(i+1)*3]))
        if i < 2:
            print("-"*5)

def check_winner(player):
    win_positions = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ]
    for pos in win_positions:
        if all(board[i] == player for i in pos):
            return True
    return False

def is_draw():
    return " " not in board

def player_move():
    move = int(input("Enter position (0-8): "))
    if board[move] == " ":
        board[move] = "X"
    else:
        print("Invalid move")
        player_move()

while True:
    print_board()
    player_move()

    if check_winner("X"):
        print_board()
        print("You win!")
        break

    if is_draw():
        print_board()
        print("Draw!")
        break
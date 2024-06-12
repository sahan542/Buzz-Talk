export default function Avatar({ userId, username, online }) {
    const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-blue-200'];
    const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length; // Corrected calculation of colorIndex
    const color = colors[colorIndex];

    return (
        <div className={`w-8 h-8 relative rounded-full flex items-center ${color}`}> {/* Added a space between classes */}
            <div className="text-center w-full opacity-40">
                {username[0]}
            </div>
            {online && (
                <div className="absolute w-3 h-3 bg-green-500 bottom-0 -right-1 rounded-lg border"></div>
            )}
            {!online && (
                 <div className="absolute w-3 h-3 bg-gray-500 bottom-0 -right-1 rounded-lg border"></div>
            )}

        </div>
    );
}

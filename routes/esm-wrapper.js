const loadFileIcons = async () => {
    const module = await import('file-icons-js');
    return module.default; // Default export from the module
};

module.exports = loadFileIcons;

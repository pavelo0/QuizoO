export type Locale = 'en' | 'ru';

export type TranslationKey =
  | 'common.refresh'
  | 'common.loading'
  | 'common.cancel'
  | 'common.save'
  | 'common.active'
  | 'common.blocked'
  | 'common.dashboard'
  | 'common.modules'
  | 'common.users'
  | 'common.analytics'
  | 'common.statistics'
  | 'common.settings'
  | 'common.profile'
  | 'common.study'
  | 'common.language'
  | 'common.lightMode'
  | 'common.darkMode'
  | 'common.allModules'
  | 'auth.signIn'
  | 'auth.email'
  | 'auth.password'
  | 'auth.logIn'
  | 'auth.signingIn'
  | 'auth.rememberMe'
  | 'auth.forgotPassword'
  | 'auth.noAccount'
  | 'auth.signUp'
  | 'auth.alreadyHaveAccount'
  | 'auth.verificationCode'
  | 'auth.verifyAndContinue'
  | 'auth.resendCode'
  | 'auth.changeEmail'
  | 'auth.sendResetCode'
  | 'auth.saving'
  | 'auth.savePasswordAndSignIn'
  | 'auth.backToProfile'
  | 'auth.backToLogin'
  | 'statistics.title'
  | 'statistics.subtitle'
  | 'statistics.overview'
  | 'statistics.scopeHint'
  | 'statistics.sessions'
  | 'statistics.sessionsHint'
  | 'statistics.cardsStudied'
  | 'statistics.cardsHint'
  | 'statistics.avgQuizScore'
  | 'statistics.avgQuizHint'
  | 'statistics.streak'
  | 'statistics.streakHint'
  | 'statistics.quizQualityTitle'
  | 'statistics.quizQualitySubtitle'
  | 'statistics.emptyQuizSeries'
  | 'statistics.emptyQuizSeriesHint'
  | 'statistics.moduleSnapshotTitle'
  | 'statistics.moduleSnapshotHint'
  | 'statistics.noModuleActivity'
  | 'statistics.priorityReviewTitle'
  | 'statistics.priorityReviewHint'
  | 'statistics.noWeakSessions'
  | 'statistics.startQuiz'
  | 'statistics.sessionHistory'
  | 'statistics.moduleLabel'
  | 'statistics.noSessionsForFilter'
  | 'statistics.loadingSessions'
  | 'statistics.type'
  | 'statistics.module'
  | 'statistics.result'
  | 'statistics.date'
  | 'statistics.quiz'
  | 'statistics.flashcards'
  | 'statistics.justNow'
  | 'statistics.yesterday'
  | 'statistics.hoursAgo'
  | 'statistics.daysAgo'
  | 'admin.overviewTitle'
  | 'admin.overviewSubtitle'
  | 'admin.totalUsers'
  | 'admin.totalModules'
  | 'admin.sessionsToday'
  | 'admin.blockedUsers'
  | 'admin.recentUsers'
  | 'admin.recentModules'
  | 'admin.viewAll'
  | 'admin.noUsers'
  | 'admin.noModules'
  | 'admin.usersTitle'
  | 'admin.usersSubtitle'
  | 'admin.manageAccess'
  | 'admin.total'
  | 'admin.user'
  | 'admin.role'
  | 'admin.joined'
  | 'admin.status'
  | 'admin.actions'
  | 'admin.loadingUsers'
  | 'admin.block'
  | 'admin.unblock'
  | 'admin.blockUser'
  | 'admin.unblockUser'
  | 'admin.blockUserQuestion'
  | 'admin.unblockUserQuestion'
  | 'admin.blockUserDescription'
  | 'admin.unblockUserDescription'
  | 'admin.protectedAdminAccounts'
  | 'admin.modulesTitle'
  | 'admin.modulesSubtitle'
  | 'admin.allModules'
  | 'admin.flashcardModules'
  | 'admin.quizModules'
  | 'admin.totalSessions'
  | 'admin.owner'
  | 'admin.cardsQuestions'
  | 'admin.updated'
  | 'admin.loadingModules'
  | 'admin.moduleTypeFlashcards'
  | 'admin.moduleTypeQuiz'
  | 'admin.cards'
  | 'admin.questions'
  | 'admin.analyticsTitle'
  | 'admin.analyticsSubtitle'
  | 'admin.userHealth'
  | 'admin.verifiedAccounts'
  | 'admin.blockedAccounts'
  | 'admin.adminAccounts'
  | 'admin.moduleActivity'
  | 'admin.activeModules'
  | 'admin.loadingState'
  | 'admin.ready'
  | 'nav.expandSidebar'
  | 'nav.compactMenu'
  | 'nav.openProfile'
  | 'settings.title'
  | 'settings.subtitle'
  | 'profile.title'
  | 'profile.subtitle'
  | 'profile.identity'
  | 'profile.security'
  | 'profile.session'
  | 'profile.uploadPhoto'
  | 'profile.remove'
  | 'profile.displayName'
  | 'profile.howOthersSeeYou'
  | 'profile.changeEmail'
  | 'profile.changePassword'
  | 'profile.logOut'
  | 'profile.signOutQuestion'
  | 'profile.signOutDescription'
  | 'profile.signingOut'
  | 'profile.signOut'
  | 'profile.loading';

export const messages: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    'common.refresh': 'Refresh',
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.active': 'Active',
    'common.blocked': 'Blocked',
    'common.dashboard': 'Dashboard',
    'common.modules': 'Modules',
    'common.users': 'Users',
    'common.analytics': 'Analytics',
    'common.statistics': 'Statistics',
    'common.settings': 'Settings',
    'common.profile': 'Profile',
    'common.study': 'Study',
    'common.language': 'Language',
    'common.lightMode': 'Light mode',
    'common.darkMode': 'Dark mode',
    'common.allModules': 'All modules',
    'auth.signIn': 'Signed in.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.logIn': 'Log in',
    'auth.signingIn': 'Signing in...',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.signUp': 'Sign up',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.verificationCode': 'Verification code',
    'auth.verifyAndContinue': 'Verify and continue',
    'auth.resendCode': 'Resend code',
    'auth.changeEmail': 'Change email',
    'auth.sendResetCode': 'Send reset code',
    'auth.saving': 'Saving...',
    'auth.savePasswordAndSignIn': 'Save password and sign in',
    'auth.backToProfile': 'Back to profile',
    'auth.backToLogin': 'Back to log in',
    'statistics.title': 'Statistics',
    'statistics.subtitle':
      'Understand study volume, quiz quality, and what to review next.',
    'statistics.overview': 'Overview',
    'statistics.scopeHint':
      'Most numbers below use current filters. Streak uses all sessions.',
    'statistics.sessions': 'Study sessions',
    'statistics.sessionsHint': 'Filtered range/module',
    'statistics.cardsStudied': 'Cards studied',
    'statistics.cardsHint': 'Flashcard cards completed',
    'statistics.avgQuizScore': 'Average quiz score',
    'statistics.avgQuizHint': 'Quiz sessions in selected range',
    'statistics.streak': 'Current streak',
    'statistics.streakHint': 'Calculated from all sessions',
    'statistics.quizQualityTitle': 'Quiz quality over time',
    'statistics.quizQualitySubtitle':
      'Average score per day for the selected range and module filter.',
    'statistics.emptyQuizSeries': 'No quiz sessions yet for selected filters.',
    'statistics.emptyQuizSeriesHint':
      'Complete at least one quiz session to unlock this chart.',
    'statistics.moduleSnapshotTitle': 'Module activity snapshot',
    'statistics.moduleSnapshotHint':
      'Sessions and best quiz result per module for current filters.',
    'statistics.noModuleActivity':
      'No activity for selected filters. Try “All time” or another module.',
    'statistics.priorityReviewTitle': 'Priority review',
    'statistics.priorityReviewHint':
      'Lowest quiz results per module. Use this list to pick what to repeat first.',
    'statistics.noWeakSessions':
      'Great job. No weak quiz sessions found for current filters.',
    'statistics.startQuiz': 'Start quiz',
    'statistics.sessionHistory': 'Session history',
    'statistics.moduleLabel': 'Module:',
    'statistics.noSessionsForFilter': 'No sessions found for this filter.',
    'statistics.loadingSessions': 'Loading sessions...',
    'statistics.type': 'Type',
    'statistics.module': 'Module',
    'statistics.result': 'Result',
    'statistics.date': 'Date',
    'statistics.quiz': 'Quiz',
    'statistics.flashcards': 'Flashcards',
    'statistics.justNow': 'just now',
    'statistics.yesterday': 'yesterday',
    'statistics.hoursAgo': '{count}h ago',
    'statistics.daysAgo': '{count}d ago',
    'admin.overviewTitle': 'Admin Overview',
    'admin.overviewSubtitle': 'Main platform metrics and latest activity.',
    'admin.totalUsers': 'Total users',
    'admin.totalModules': 'Total modules',
    'admin.sessionsToday': 'Sessions today',
    'admin.blockedUsers': 'Blocked users',
    'admin.recentUsers': 'Recently registered users',
    'admin.recentModules': 'Recently updated modules',
    'admin.viewAll': 'View all',
    'admin.noUsers': 'No users found.',
    'admin.noModules': 'No modules found.',
    'admin.usersTitle': 'Admin Users',
    'admin.usersSubtitle': 'Manage user access and monitor account statuses.',
    'admin.manageAccess': 'Manage user access and monitor account statuses.',
    'admin.total': 'Total users',
    'admin.user': 'User',
    'admin.role': 'Role',
    'admin.joined': 'Joined',
    'admin.status': 'Status',
    'admin.actions': 'Actions',
    'admin.loadingUsers': 'Loading users...',
    'admin.block': 'Block',
    'admin.unblock': 'Unblock',
    'admin.blockUser': 'Block user',
    'admin.unblockUser': 'Unblock user',
    'admin.blockUserQuestion': 'Block user?',
    'admin.unblockUserQuestion': 'Unblock user?',
    'admin.blockUserDescription': 'This will prevent {email} from signing in.',
    'admin.unblockUserDescription': 'This will allow {email} to sign in again.',
    'admin.protectedAdminAccounts': 'Admin accounts are protected',
    'admin.modulesTitle': 'Admin Modules',
    'admin.modulesSubtitle': 'View all modules and their owner activity.',
    'admin.allModules': 'All modules',
    'admin.flashcardModules': 'Flashcard modules',
    'admin.quizModules': 'Quiz modules',
    'admin.totalSessions': 'Total sessions',
    'admin.owner': 'Owner',
    'admin.cardsQuestions': 'Cards/Questions',
    'admin.updated': 'Updated',
    'admin.loadingModules': 'Loading modules...',
    'admin.moduleTypeFlashcards': 'Flashcards',
    'admin.moduleTypeQuiz': 'Quiz',
    'admin.cards': '{count} cards',
    'admin.questions': '{count} questions',
    'admin.analyticsTitle': 'Admin Analytics',
    'admin.analyticsSubtitle': 'Distribution snapshots for users and content.',
    'admin.userHealth': 'User health',
    'admin.verifiedAccounts': 'Verified accounts',
    'admin.blockedAccounts': 'Blocked accounts',
    'admin.adminAccounts': 'Admin accounts',
    'admin.moduleActivity': 'Module activity',
    'admin.activeModules': 'Active modules',
    'admin.loadingState': 'Loading state',
    'admin.ready': 'Ready',
    'nav.expandSidebar': 'Expand sidebar',
    'nav.compactMenu': 'Compact menu (icons only)',
    'nav.openProfile': 'Open profile',
    'settings.title': 'Settings',
    'settings.subtitle': 'Account preferences.',
    'profile.title': 'Profile',
    'profile.subtitle':
      'Photo, display name, email, and password. Sign out when you are done on this device.',
    'profile.identity': 'Identity',
    'profile.security': 'Security',
    'profile.session': 'Session',
    'profile.uploadPhoto': 'Upload photo',
    'profile.remove': 'Remove',
    'profile.displayName': 'Display name',
    'profile.howOthersSeeYou': 'How others see you',
    'profile.changeEmail': 'Change email',
    'profile.changePassword': 'Change password',
    'profile.logOut': 'Log out',
    'profile.signOutQuestion': 'Sign out?',
    'profile.signOutDescription':
      'You will need to sign in again to access your modules and progress.',
    'profile.signingOut': 'Signing out...',
    'profile.signOut': 'Sign out',
    'profile.loading': 'Loading profile...',
  },
  ru: {
    'common.refresh': 'Обновить',
    'common.loading': 'Загрузка...',
    'common.cancel': 'Отмена',
    'common.save': 'Сохранить',
    'common.active': 'Активен',
    'common.blocked': 'Заблокирован',
    'common.dashboard': 'Панель',
    'common.modules': 'Модули',
    'common.users': 'Пользователи',
    'common.analytics': 'Аналитика',
    'common.statistics': 'Статистика',
    'common.settings': 'Настройки',
    'common.profile': 'Профиль',
    'common.study': 'Учить',
    'common.language': 'Язык',
    'common.lightMode': 'Светлая тема',
    'common.darkMode': 'Тёмная тема',
    'common.allModules': 'Все модули',
    'auth.signIn': 'Вход выполнен.',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.logIn': 'Войти',
    'auth.signingIn': 'Вход...',
    'auth.rememberMe': 'Запомнить меня',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.signUp': 'Зарегистрироваться',
    'auth.alreadyHaveAccount': 'Уже есть аккаунт?',
    'auth.verificationCode': 'Код подтверждения',
    'auth.verifyAndContinue': 'Подтвердить и продолжить',
    'auth.resendCode': 'Отправить код снова',
    'auth.changeEmail': 'Изменить email',
    'auth.sendResetCode': 'Отправить код сброса',
    'auth.saving': 'Сохранение...',
    'auth.savePasswordAndSignIn': 'Сохранить пароль и войти',
    'auth.backToProfile': 'Назад в профиль',
    'auth.backToLogin': 'Назад ко входу',
    'statistics.title': 'Статистика',
    'statistics.subtitle':
      'Отслеживайте объём обучения, качество тестов и что повторить дальше.',
    'statistics.overview': 'Обзор',
    'statistics.scopeHint':
      'Большинство метрик ниже учитывают фильтры. Стрик считается по всем сессиям.',
    'statistics.sessions': 'Учебные сессии',
    'statistics.sessionsHint': 'С учётом выбранного диапазона/модуля',
    'statistics.cardsStudied': 'Изучено карточек',
    'statistics.cardsHint': 'Карточки из flashcard-сессий',
    'statistics.avgQuizScore': 'Средний балл тестов',
    'statistics.avgQuizHint': 'Quiz-сессии в выбранном диапазоне',
    'statistics.streak': 'Текущий стрик',
    'statistics.streakHint': 'Считается по всем сессиям',
    'statistics.quizQualityTitle': 'Качество тестов во времени',
    'statistics.quizQualitySubtitle':
      'Средний балл по дням для выбранного диапазона и фильтра модуля.',
    'statistics.emptyQuizSeries': 'Нет quiz-сессий для выбранных фильтров.',
    'statistics.emptyQuizSeriesHint':
      'Пройдите хотя бы одну quiz-сессию, чтобы увидеть график.',
    'statistics.moduleSnapshotTitle': 'Активность по модулям',
    'statistics.moduleSnapshotHint':
      'Сессии и лучший результат теста по модулям в текущих фильтрах.',
    'statistics.noModuleActivity':
      'Нет активности для выбранных фильтров. Попробуйте «За всё время» или другой модуль.',
    'statistics.priorityReviewTitle': 'Повторить в приоритете',
    'statistics.priorityReviewHint':
      'Худшие результаты тестов по модулям. Начните повторение отсюда.',
    'statistics.noWeakSessions':
      'Отлично! Слабых quiz-сессий не найдено для текущих фильтров.',
    'statistics.startQuiz': 'Начать тест',
    'statistics.sessionHistory': 'История сессий',
    'statistics.moduleLabel': 'Модуль:',
    'statistics.noSessionsForFilter': 'Нет сессий для этого фильтра.',
    'statistics.loadingSessions': 'Загружаем сессии...',
    'statistics.type': 'Тип',
    'statistics.module': 'Модуль',
    'statistics.result': 'Результат',
    'statistics.date': 'Дата',
    'statistics.quiz': 'Тест',
    'statistics.flashcards': 'Карточки',
    'statistics.justNow': 'только что',
    'statistics.yesterday': 'вчера',
    'statistics.hoursAgo': '{count}ч назад',
    'statistics.daysAgo': '{count}д назад',
    'admin.overviewTitle': 'Админ-панель',
    'admin.overviewSubtitle':
      'Основные метрики платформы и последняя активность.',
    'admin.totalUsers': 'Всего пользователей',
    'admin.totalModules': 'Всего модулей',
    'admin.sessionsToday': 'Сессий сегодня',
    'admin.blockedUsers': 'Заблокировано',
    'admin.recentUsers': 'Недавно зарегистрированные',
    'admin.recentModules': 'Недавно обновлённые модули',
    'admin.viewAll': 'Смотреть все',
    'admin.noUsers': 'Пользователи не найдены.',
    'admin.noModules': 'Модули не найдены.',
    'admin.usersTitle': 'Пользователи',
    'admin.usersSubtitle': 'Управляйте доступом и статусами аккаунтов.',
    'admin.manageAccess': 'Управляйте доступом и статусами аккаунтов.',
    'admin.total': 'Всего пользователей',
    'admin.user': 'Пользователь',
    'admin.role': 'Роль',
    'admin.joined': 'Дата регистрации',
    'admin.status': 'Статус',
    'admin.actions': 'Действия',
    'admin.loadingUsers': 'Загружаем пользователей...',
    'admin.block': 'Блок',
    'admin.unblock': 'Разблок',
    'admin.blockUser': 'Заблокировать',
    'admin.unblockUser': 'Разблокировать',
    'admin.blockUserQuestion': 'Заблокировать пользователя?',
    'admin.unblockUserQuestion': 'Разблокировать пользователя?',
    'admin.blockUserDescription': 'Пользователь {email} не сможет войти.',
    'admin.unblockUserDescription':
      'Пользователь {email} снова сможет войти в систему.',
    'admin.protectedAdminAccounts': 'Админ-аккаунты защищены от блокировки',
    'admin.modulesTitle': 'Модули',
    'admin.modulesSubtitle': 'Просмотр всех модулей и активности владельцев.',
    'admin.allModules': 'Все модули',
    'admin.flashcardModules': 'Flashcard модули',
    'admin.quizModules': 'Quiz модули',
    'admin.totalSessions': 'Всего сессий',
    'admin.owner': 'Владелец',
    'admin.cardsQuestions': 'Карточки/Вопросы',
    'admin.updated': 'Обновлён',
    'admin.loadingModules': 'Загружаем модули...',
    'admin.moduleTypeFlashcards': 'Карточки',
    'admin.moduleTypeQuiz': 'Тест',
    'admin.cards': '{count} карточек',
    'admin.questions': '{count} вопросов',
    'admin.analyticsTitle': 'Аналитика',
    'admin.analyticsSubtitle':
      'Срез распределений по пользователям и контенту.',
    'admin.userHealth': 'Состояние пользователей',
    'admin.verifiedAccounts': 'Подтверждённые аккаунты',
    'admin.blockedAccounts': 'Заблокированные аккаунты',
    'admin.adminAccounts': 'Админ-аккаунты',
    'admin.moduleActivity': 'Активность модулей',
    'admin.activeModules': 'Активные модули',
    'admin.loadingState': 'Состояние загрузки',
    'admin.ready': 'Готово',
    'nav.expandSidebar': 'Развернуть меню',
    'nav.compactMenu': 'Свернуть меню (только иконки)',
    'nav.openProfile': 'Открыть профиль',
    'settings.title': 'Настройки',
    'settings.subtitle': 'Параметры аккаунта.',
    'profile.title': 'Профиль',
    'profile.subtitle':
      'Фото, имя, email и пароль. Выйдите из аккаунта, когда закончите работу на этом устройстве.',
    'profile.identity': 'Личные данные',
    'profile.security': 'Безопасность',
    'profile.session': 'Сессия',
    'profile.uploadPhoto': 'Загрузить фото',
    'profile.remove': 'Удалить',
    'profile.displayName': 'Отображаемое имя',
    'profile.howOthersSeeYou': 'Как вас видят другие',
    'profile.changeEmail': 'Изменить email',
    'profile.changePassword': 'Сменить пароль',
    'profile.logOut': 'Выйти',
    'profile.signOutQuestion': 'Выйти из аккаунта?',
    'profile.signOutDescription':
      'Чтобы снова получить доступ к модулям и прогрессу, нужно будет войти заново.',
    'profile.signingOut': 'Выходим...',
    'profile.signOut': 'Выйти',
    'profile.loading': 'Загружаем профиль...',
  },
};
